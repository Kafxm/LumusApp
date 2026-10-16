'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, LockKeyhole, LogIn, ShieldAlert, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { LumusLogo, selectClass } from './shared';

export const USERS_KEY = 'users';
export const CURRENT_USER_KEY = 'currentUser';
const FAILED_ATTEMPTS_KEY = 'failedLoginAttempts';
const LOCKOUT_UNTIL_KEY = 'lockoutUntil';
const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION = 3 * 60 * 1000;
const VALID_ROLES = ['creador', 'empresa', 'admin'];

function getUsers() {
    const rawUsers = window.localStorage.getItem(USERS_KEY);
    if (!rawUsers) return [];

    let users;
    try {
        users = JSON.parse(rawUsers);
    } catch (error) {
        console.error('La lista de usuarios guardada no es válida.', error);
        throw new Error('No se pudo leer la lista de usuarios. Limpia los datos dañados e inténtalo de nuevo.');
    }

    if (!Array.isArray(users)) {
        throw new Error('El formato de la lista de usuarios no es válido.');
    }
    return users;
}

function toBase64(bytes) {
    return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

function fromBase64(value) {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function hashPassword(password, salt) {
    if (!window.crypto?.subtle) {
        throw new Error('El navegador no permite proteger contraseñas en este origen. Usa HTTPS o localhost.');
    }

    const key = await window.crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveBits'],
    );
    const hash = await window.crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt ? fromBase64(salt) : window.crypto.getRandomValues(new Uint8Array(16)),
            iterations: 120000,
            hash: 'SHA-256',
        },
        key,
        256,
    );
    return toBase64(hash);
}

function getSafeUser(user) {
    return {
        id: user.id,
        name: user.name,
        identification: user.identification,
        email: user.email,
        role: user.role,
        creatorId: user.creatorId,
    };
}

export function AuthView({ onAuthenticated, onCancel, initialMode = 'login', initialRole = 'creador' }) {
    const [mode, setMode] = useState(initialMode);
    const [ready, setReady] = useState(false);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [lockoutUntil, setLockoutUntil] = useState(0);
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        try {
            const storedAttempts = Number(window.localStorage.getItem(FAILED_ATTEMPTS_KEY) || 0);
            const storedLockout = Number(window.localStorage.getItem(LOCKOUT_UNTIL_KEY) || 0);
            const validAttempts = Number.isInteger(storedAttempts) && storedAttempts >= 0 ? storedAttempts : 0;
            const validLockout = Number.isFinite(storedLockout) && storedLockout > Date.now() ? storedLockout : 0;

            setFailedAttempts(validAttempts);
            setLockoutUntil(validLockout);
            setNow(Date.now());

            if (!validLockout && storedLockout) {
                window.localStorage.removeItem(LOCKOUT_UNTIL_KEY);
                window.localStorage.removeItem(FAILED_ATTEMPTS_KEY);
            }
        } catch (error) {
            console.error('No se pudo recuperar el estado de autenticación.', error);
            setMessage('No se pudo acceder al almacenamiento local. Revisa la configuración del navegador.');
        } finally {
            setReady(true);
        }
    }, []);

    useEffect(() => {
        if (!lockoutUntil) return undefined;
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, [lockoutUntil]);

    useEffect(() => {
        if (!lockoutUntil || now < lockoutUntil) return;

        try {
            window.localStorage.removeItem(LOCKOUT_UNTIL_KEY);
            window.localStorage.removeItem(FAILED_ATTEMPTS_KEY);
            setLockoutUntil(0);
            setFailedAttempts(0);
        } catch (error) {
            console.error('No se pudo limpiar el bloqueo vencido.', error);
            setMessage('El bloqueo venció, pero no se pudo actualizar el almacenamiento local.');
        }
    }, [lockoutUntil, now]);

    const remainingSeconds = lockoutUntil ? Math.max(0, Math.ceil((lockoutUntil - now) / 1000)) : 0;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    const isLocked = remainingSeconds > 0;

    async function handleSubmit(event) {
        event.preventDefault();
        if (!ready || busy || isLocked) return;

        const formData = new FormData(event.currentTarget);
        const name = String(formData.get('name') || '').trim();
        const identification = String(formData.get('identification') || '').trim();
        const email = String(formData.get('email') || '').trim().toLowerCase();
        const password = String(formData.get('password') || '');
        const repeatedPassword = String(formData.get('repeatPassword') || '');
        const selectedRole = String(formData.get('role') || 'creador');

        setBusy(true);
        setMessage('');

        try {
            const users = getUsers();
            if (!/^\d+$/.test(identification)) {
                setMessage('El número de identificación debe contener únicamente números.');
                return;
            }

            if (mode === 'register') {
                if (!['creador', 'empresa', 'admin'].includes(selectedRole)) {
                    throw new Error('Selecciona un rol válido para crear la cuenta.');
                }
                if (password !== repeatedPassword) {
                    setMessage('Las contraseñas no coinciden.');
                    return;
                }
                if (users.some((user) => String(user.email).toLowerCase() === email)) {
                    setMessage('Ya existe una cuenta registrada con ese correo.');
                    return;
                }
                if (users.some((user) => user.identification === identification)) {
                    setMessage('Ya existe una cuenta registrada con ese número de identificación.');
                    return;
                }

                const salt = toBase64(window.crypto.getRandomValues(new Uint8Array(16)));
                const passwordHash = await hashPassword(password, salt);
                const newUserId = window.crypto.randomUUID();
                const role = selectedRole;
                const newUser = {
                    id: newUserId,
                    name,
                    identification,
                    email,
                    role,
                    creatorId: role === 'creador' ? `creator_${newUserId}` : null,
                    passwordHash,
                    salt,
                };
                const sessionUser = getSafeUser(newUser);

                window.localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
                window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
                window.localStorage.removeItem(FAILED_ATTEMPTS_KEY);
                window.localStorage.removeItem(LOCKOUT_UNTIL_KEY);
                setFailedAttempts(0);
                setLockoutUntil(0);
                onAuthenticated(sessionUser);
                return;
            }

            const user = users.find((candidate) =>
                candidate.identification === identification &&
                String(candidate.email).toLowerCase() === email,
            );
            const passwordHash = user?.passwordHash && user?.salt
                ? await hashPassword(password, user.salt)
                : '';

            if (!user || !VALID_ROLES.includes(user.role) || passwordHash !== user.passwordHash) {
                const nextAttempts = failedAttempts + 1;
                window.localStorage.setItem(FAILED_ATTEMPTS_KEY, String(nextAttempts));
                setFailedAttempts(nextAttempts);

                if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
                    const until = Date.now() + LOCKOUT_DURATION;
                    window.localStorage.setItem(LOCKOUT_UNTIL_KEY, String(until));
                    setLockoutUntil(until);
                    setNow(Date.now());
                    setMessage('');
                } else {
                    setMessage(`Datos de acceso incorrectos. Intento ${nextAttempts} de ${MAX_FAILED_ATTEMPTS}.`);
                }
                return;
            }

            const sessionUser = getSafeUser(user);
            window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
            window.localStorage.removeItem(FAILED_ATTEMPTS_KEY);
            window.localStorage.removeItem(LOCKOUT_UNTIL_KEY);
            setFailedAttempts(0);
            setLockoutUntil(0);
            onAuthenticated(sessionUser);
        } catch (error) {
            console.error('No se pudo completar la autenticación.', error);
            setMessage(error instanceof Error ? error.message : 'No se pudo completar la autenticación.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-10">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 -top-24 -z-0 mx-auto h-96 max-w-3xl rounded-full bg-brand-sky/50 blur-3xl"
            />
            <section className="relative z-10 w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl shadow-primary/10 sm:p-8">
                <div className="mb-6 flex flex-col items-center gap-4 text-center">
                    <LumusLogo />
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {mode === 'login' ? 'Bienvenido a Lumus' : 'Crea tu cuenta'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {mode === 'login'
                                ? 'Ingresa para continuar con tu comunidad.'
                                : 'Conecta tu talento con nuevas oportunidades.'}
                        </p>
                    </div>
                </div>

                {isLocked && (
                    <div
                        role="alert"
                        aria-live="assertive"
                        className="mb-5 flex gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
                    >
                        <ShieldAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                        <p>
                            Acceso bloqueado por seguridad. Inténtalo de nuevo en {minutes}{' '}
                            {minutes === 1 ? 'minuto' : 'minutos'} / {seconds}{' '}
                            {seconds === 1 ? 'segundo' : 'segundos'}.
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {mode === 'register' && (
                        <>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="auth-name">Nombre</Label>
                                <Input
                                    id="auth-name"
                                    name="name"
                                    autoComplete="name"
                                    placeholder="Tu nombre"
                                    minLength={2}
                                    maxLength={80}
                                    required
                                    disabled={!ready || busy || isLocked}
                                    className="h-10 px-3"
                                />
                            </div>
                        </>
                    )}

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="auth-identification">Número de identificación</Label>
                        <Input
                            id="auth-identification"
                            name="identification"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]+"
                            autoComplete="off"
                            placeholder="Solo números"
                            required
                            disabled={!ready || busy || isLocked}
                            className="h-10 px-3"
                        />
                    </div>

                    {mode === 'register' && (
                        <>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="auth-role">Quiero registrarme como</Label>
                                <select
                                    id="auth-role"
                                    name="role"
                                    defaultValue={initialRole}
                                    disabled={!ready || busy || isLocked}
                                    className={cn(selectClass, 'h-10')}
                                >
                                    <option value="creador">Creador</option>
                                    <option value="empresa">Empresa</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="auth-email">Correo electrónico</Label>
                        <Input
                            id="auth-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="nombre@correo.com"
                            required
                            disabled={!ready || busy || isLocked}
                            className="h-10 px-3"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="auth-password">Contraseña</Label>
                        <Input
                            id="auth-password"
                            name="password"
                            type="password"
                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                            placeholder="Mínimo 8 caracteres"
                            minLength={8}
                            required
                            disabled={!ready || busy || isLocked}
                            className="h-10 px-3"
                        />
                    </div>

                    {mode === 'register' && (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="auth-repeat-password">Repetir contraseña</Label>
                            <Input
                                id="auth-repeat-password"
                                name="repeatPassword"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Confirma tu contraseña"
                                minLength={8}
                                required
                                disabled={!ready || busy || isLocked}
                                className="h-10 px-3"
                            />
                        </div>
                    )}

                    {message && (
                        <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {message}
                        </p>
                    )}

                    <Button type="submit" className="mt-1 h-10 w-full" disabled={!ready || busy || isLocked}>
                        {mode === 'login' ? <LogIn aria-hidden="true" /> : <UserPlus aria-hidden="true" />}
                        {isLocked
                            ? 'Acceso temporalmente bloqueado'
                            : busy
                                ? 'Procesando…'
                                : mode === 'login'
                                    ? 'Iniciar sesión'
                                    : 'Crear cuenta'}
                    </Button>
                </form>

                <div className="my-5 flex items-center gap-3">
                    <span className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">o</span>
                    <span className="h-px flex-1 bg-border" />
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    {mode === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya tienes una cuenta?'}{' '}
                    <button
                        type="button"
                        disabled={!ready || busy || isLocked}
                        onClick={() => {
                            setMessage('');
                            setMode(mode === 'login' ? 'register' : 'login');
                        }}
                        className="font-medium text-link underline-offset-4 hover:underline disabled:pointer-events-none disabled:opacity-50"
                    >
                        {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
                    </button>
                </p>

                {onCancel && (
                    <Button type="button" variant="ghost" className="mt-4 w-full" onClick={onCancel}>
                        <ArrowLeft aria-hidden="true" />
                        Volver a explorar Lumus
                    </Button>
                )}

                <p className="mt-6 flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
                    <LockKeyhole className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span>Prototipo local: las cuentas y el bloqueo se guardan en este navegador; no reemplaza autenticación de servidor.</span>
                </p>
            </section>
        </main>
    );
}
