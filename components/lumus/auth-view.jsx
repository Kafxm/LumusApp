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
const ADMIN_ACCOUNT = {
    name: 'Administrador Lumus',
    email: 'admin@lumus.com',
    identification: '1000000000',
    password: 'Admin1234!',
    role: 'admin',
};

async function ensureDefaultAdminUser() {
    const users = getUsers();
    const adminExists = users.some((user) => String(user.email).toLowerCase() === ADMIN_ACCOUNT.email);

    if (adminExists) return users;

    const salt = toBase64(window.crypto.getRandomValues(new Uint8Array(16)));
    const passwordHash = await hashPassword(ADMIN_ACCOUNT.password, salt);
    const adminUser = {
        id: 'admin-lumus-seed',
        name: ADMIN_ACCOUNT.name,
        identification: ADMIN_ACCOUNT.identification,
        email: ADMIN_ACCOUNT.email,
        role: ADMIN_ACCOUNT.role,
        creatorId: null,
        passwordHash,
        salt,
    };

    window.localStorage.setItem(USERS_KEY, JSON.stringify([...users, adminUser]));
    return [...users, adminUser];
}

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
        (async () => {
            try {
                await ensureDefaultAdminUser();
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
        })();
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
    const lockoutProgress = lockoutUntil ? Math.max(8, (remainingSeconds / (LOCKOUT_DURATION / 1000)) * 100) : 0;

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
                if (!['creador', 'empresa'].includes(selectedRole)) {
                    throw new Error('El acceso de administrador se gestiona desde una cuenta especial de Lumus.');
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
                        className="mb-4"
                    >
                        <div className="mx-auto flex w-full max-w-[240px] items-center justify-center gap-2 rounded-[22px] border border-red-100 bg-red-50 px-3 py-2 shadow-[0_10px_24px_rgba(153,27,27,0.04)]">
                            <div className="flex items-center gap-1.5 text-red-600">
                                <ShieldAlert className="size-3.5" aria-hidden="true" />
                                <p className="text-[11px] font-medium leading-tight text-red-600">
                                    Acceso bloqueado por seguridad.
                                </p>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <div className="flex min-w-[52px] flex-col items-center rounded-lg bg-white/80 px-1.5 py-1">
                                    <span className="text-[7px] font-medium uppercase tracking-[0.12em] text-red-400">MIN</span>
                                    <span className="text-base font-semibold leading-none text-red-700">
                                        {String(minutes).padStart(2, '0')}
                                    </span>
                                </div>
                                <div className="flex min-w-[52px] flex-col items-center rounded-lg bg-white/80 px-1.5 py-1">
                                    <span className="text-[7px] font-medium uppercase tracking-[0.12em] text-red-400">SEG</span>
                                    <span className="text-base font-semibold leading-none text-red-700">
                                        {String(seconds).padStart(2, '0')}
                                    </span>
                                </div>
                            </div>
                        </div>
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
                                    defaultValue={initialRole === 'admin' ? 'creador' : initialRole}
                                    disabled={!ready || busy || isLocked}
                                    className={cn(selectClass, 'h-10')}
                                >
                                    <option value="creador">Creador</option>
                                    <option value="empresa">Empresa</option>
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

                <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-foreground">
                    <p className="mb-1 font-medium">Cuenta de administración</p>
                    <p className="text-muted-foreground">Correo: admin@lumus.com</p>
                    <p className="text-muted-foreground">Contraseña: Admin1234!</p>
                </div>

                <p className="mt-6 flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
                    <LockKeyhole className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span>Prototipo local: las cuentas y el bloqueo se guardan en este navegador; no reemplaza autenticación de servidor.</span>
                </p>
            </section>
        </main>
    );
}
