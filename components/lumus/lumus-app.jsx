'use client';
import { useEffect, useState } from 'react';
import { Briefcase, CreditCard, Heart, Home, Inbox, LayoutDashboard, LifeBuoy, LogIn, LogOut, Search, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LumusProvider, useLumus } from '@/lib/lumus/store';
import { AuthView, CURRENT_USER_KEY } from './auth-view';
import { LumusLogo } from './shared';
import { AdminView } from './views/admin-view';
import { CatalogView } from './views/catalog-view';
import { HomeView } from './views/home-view';
import { InboxView } from './views/inbox-view';
import { PlansView } from './views/plans-view';
import { PortfolioView } from './views/portfolio-view';
import { SupportView } from './views/support-view';

const NAV = {
    invitado: [
        { id: 'inicio', label: 'Inicio', icon: Home },
        { id: 'explorar', label: 'Explorar talento', icon: Search },
        { id: 'planes', label: 'Planes', icon: CreditCard },
        { id: 'ingresar', label: 'Iniciar sesión', icon: LogIn },
    ],
    creador: [
        { id: 'inicio', label: 'Inicio', icon: Home },
        { id: 'explorar', label: 'Explorar talento', icon: Search },
        { id: 'portafolio', label: 'Mi portafolio', icon: UserRound },
        { id: 'buzon', label: 'Buzón', icon: Inbox },
        { id: 'planes', label: 'Suscripción', icon: CreditCard },
        { id: 'soporte', label: 'Soporte', icon: LifeBuoy },
    ],
    empresa: [
        { id: 'inicio', label: 'Inicio', icon: Home },
        { id: 'explorar', label: 'Explorar talento', icon: Search },
        { id: 'catalogo', label: 'Catálogo', icon: Briefcase },
        { id: 'favoritos', label: 'Favoritos', icon: Heart },
        { id: 'buzon', label: 'Buzón', icon: Inbox },
        { id: 'soporte', label: 'Soporte', icon: LifeBuoy },
    ],
    admin: [
        { id: 'inicio', label: 'Inicio', icon: Home },
        { id: 'explorar', label: 'Explorar talento', icon: Search },
        { id: 'admin', label: 'Panel admin', icon: LayoutDashboard },
    ],
};

const VALID_ROLES = ['creador', 'empresa', 'admin'];

function Shell() {
    const { state, hydrated, setRole, activateUser } = useLumus();
    const [view, setView] = useState('inicio');
    const [currentUser, setCurrentUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [authRequest, setAuthRequest] = useState({ mode: 'login', role: 'creador' });
    const nav = NAV[state.role] ?? NAV.invitado;
    const activeView = nav.some((item) => item.id === view) ? view : nav[0].id;

    function getRoleHome(role) {
        if (role === 'creador') return 'portafolio';
        if (role === 'empresa') return 'catalogo';
        if (role === 'admin') return 'admin';
        return 'inicio';
    }

    useEffect(() => {
        if (!hydrated) return;

        try {
            const rawUser = window.localStorage.getItem(CURRENT_USER_KEY);
            let savedUser = null;

            if (rawUser) {
                try {
                    savedUser = JSON.parse(rawUser);
                } catch (error) {
                    console.error('La sesión guardada de Lumus no es válida.', error);
                    window.localStorage.removeItem(CURRENT_USER_KEY);
                }
            }

            if (savedUser && VALID_ROLES.includes(savedUser.role) && savedUser.email && savedUser.name) {
                setCurrentUser(savedUser);
                activateUser(savedUser);
                setView(getRoleHome(savedUser.role));
            } else {
                setRole('invitado');
            }
        } catch (error) {
            console.error('No se pudo recuperar la sesión de Lumus.', error);
            toast.error('No se pudo leer la sesión guardada en este navegador.');
            setRole('invitado');
        } finally {
            setAuthReady(true);
        }
    }, [hydrated, setRole, activateUser]);

    function handleAuthenticated(user) {
        setCurrentUser(user);
        activateUser(user);
        setView(getRoleHome(user.role));
        window.scrollTo({ top: 0 });
    }

    function openAuth(mode = 'login', role = 'creador') {
        setAuthRequest({ mode, role });
        setView('ingresar');
        window.scrollTo({ top: 0 });
    }

    function requireRole(role, message) {
        toast.info(message);
        openAuth('login', role);
    }

    function handleHomeEntry(role) {
        if (currentUser?.role === 'creador' && role === 'creador') {
            setView('portafolio');
            window.scrollTo({ top: 0 });
            return;
        }

        if (currentUser?.role === 'empresa' && role === 'empresa') {
            setView('catalogo');
            window.scrollTo({ top: 0 });
            return;
        }

        if (!currentUser) {
            openAuth('register', role);
        }
    }

    function handleLogout() {
        try {
            window.localStorage.removeItem(CURRENT_USER_KEY);
            setCurrentUser(null);
            setRole('invitado');
            setView('inicio');
            setAuthRequest({ mode: 'login', role: 'creador' });
            window.scrollTo({ top: 0 });
        } catch (error) {
            console.error('No se pudo cerrar la sesión de Lumus.', error);
            toast.error('No se pudo cerrar la sesión. Inténtalo de nuevo.');
        }
    }

    function renderView() {
        switch (activeView) {
            case 'inicio':
                return (
                    <HomeView
                        onEnter={handleHomeEntry}
                        onNavigate={setView}
                    />
                );
            case 'ingresar':
                return (
                    <AuthView
                        key={`${authRequest.mode}-${authRequest.role}`}
                        initialMode={authRequest.mode}
                        initialRole={authRequest.role}
                        onAuthenticated={handleAuthenticated}
                        onCancel={() => setView('inicio')}
                    />
                );
            case 'explorar':
            case 'catalogo':
            case 'favoritos':
                return (
                    <CatalogView
                        key={activeView}
                        mode={activeView}
                        onRequireCompany={() => requireRole('empresa', 'Inicia sesión como empresa para contactar y guardar talento.')}
                    />
                );
            case 'portafolio':
                return <PortfolioView onUpgrade={() => setView('planes')} />;
            case 'buzon':
                return <InboxView key={state.role} />;
            case 'planes':
                return <PlansView onRequireCreator={() => requireRole('creador', 'Inicia sesión como creador para suscribirte.')} />;
            case 'soporte':
                return <SupportView />;
            case 'admin':
                return <AdminView />;
            default:
                return null;
        }
    }

    if (!authReady || !hydrated) return null;

    const unread = state.threads.filter((thread) => state.role === 'creador'
        ? thread.creatorId === state.currentCreatorId && !thread.readByCreator
        : state.role === 'empresa' && thread.company === state.currentCompany && !thread.readByCompany).length;

    return (
        <div className="flex min-h-dvh flex-col">
            <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
                    <button
                        type="button"
                        onClick={() => setView('inicio')}
                        className="rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        aria-label="Lumus, ir al inicio"
                    >
                        <LumusLogo />
                    </button>

                    <nav aria-label="Principal" className="hidden flex-1 md:block">
                        <ul className="flex items-center gap-1">
                            {nav.map((item) => (
                                <li key={item.id}>
                                    <NavButton
                                        item={item}
                                        active={activeView === item.id}
                                        badge={item.id === 'buzon' ? unread : 0}
                                        onClick={() => setView(item.id)}
                                    />
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="ml-auto flex items-center gap-2">
                        {currentUser ? (
                            <>
                                <span className="hidden text-xs text-muted-foreground sm:block">{currentUser.name}</span>
                                <Button variant="ghost" size="sm" aria-label="Cerrar sesión" onClick={handleLogout}>
                                    <LogOut aria-hidden="true" />
                                    Cerrar sesión
                                </Button>
                            </>
                        ) : (
                            <Button variant="ghost" size="sm" onClick={() => openAuth()}>
                                <LogIn aria-hidden="true" />
                                Iniciar sesión
                            </Button>
                        )}
                    </div>
                </div>

                <nav aria-label="Principal móvil" className="border-t md:hidden">
                    <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2">
                        {nav.map((item) => (
                            <li key={item.id} className="shrink-0">
                                <NavButton
                                    item={item}
                                    active={activeView === item.id}
                                    badge={item.id === 'buzon' ? unread : 0}
                                    onClick={() => setView(item.id)}
                                />
                            </li>
                        ))}
                    </ul>
                </nav>
            </header>

            <main className={cn('mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10', !hydrated && 'opacity-0')}>
                {renderView()}
            </main>

            <footer className="border-t">
                <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <LumusLogo className="text-foreground" />
                    <p>Prototipo funcional · Datos de demostración guardados en este navegador.</p>
                </div>
            </footer>
        </div>
    );
}

function NavButton({ item, active, badge, onClick }) {
    const Icon = item.icon;
    return (
        <button
            type="button"
            onClick={onClick}
            aria-current={active ? 'page' : undefined}
            className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50',
                active ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
            )}
        >
            <Icon className="size-4" aria-hidden="true" />
            {item.label}
            {badge > 0 && (
                <span className="grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                    {badge}
                    <span className="sr-only"> sin leer</span>
                </span>
            )}
        </button>
    );
}

export function LumusApp() {
    return (
        <LumusProvider>
            <Shell />
        </LumusProvider>
    );
}
