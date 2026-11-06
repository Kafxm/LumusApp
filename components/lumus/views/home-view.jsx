'use client';
import { ArrowRight, Building2, FileVideo, GitBranch, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLumus } from '@/lib/lumus/store';
import { CreatorAvatar, VerifiedBadge } from '../shared';
const FEATURES = [
    {
        icon: FileVideo,
        title: 'Reputación por evidencia',
        body: 'Cada proyecto incluye repositorio y video demostrativo. Lo que importa es lo que construyes, no el diploma.',
    },
    {
        icon: Search,
        title: 'Búsqueda por competencias',
        body: 'Las empresas filtran por lenguaje y base de datos para encontrar exactamente el perfil técnico que necesitan.',
    },
    {
        icon: ShieldCheck,
        title: 'Plataforma moderada',
        body: 'Administradores validan perfiles y retiran contenido inapropiado para mantener la confianza en la comunidad.',
    },
];
export function HomeView({ onEnter, onNavigate }) {
    const { state } = useLumus();
    const featured = state.creators.slice(0, 4);
    const showCreatorEntry = state.role !== 'empresa' && state.role !== 'admin';
    const showCompanyEntry = state.role !== 'creador' && state.role !== 'admin';

    return (
        <div className="flex flex-col gap-8 pb-8 sm:gap-10">
            <section className="lumus-panel lumus-grid-glow relative overflow-hidden px-5 py-6 sm:px-8 sm:py-10 lg:px-12">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(114,157,242,0.18),transparent_22%),radial-gradient(circle_at_bottom_left,_rgba(155,209,242,0.25),transparent_24%)]" />
                <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                        <img
                            src="/brand/lumus-logo.png"
                            alt="Lumus"
                            width={520}
                            height={285}
                            className="h-auto w-44 rounded-[28px] shadow-[0_18px_45px_rgba(114,157,242,0.28)] sm:w-56"
                        />

                        <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-link shadow-sm">
                            <Sparkles className="size-3.5" aria-hidden="true" />
                            Proyecto Integrador · Ingeniería de software
                        </span>

                        <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                            Iluminando el{' '}
                            <span className="bg-gradient-to-r from-link via-primary to-info bg-clip-text text-transparent">
                                talento independiente
                            </span>
                        </h1>

                        <p className="mt-4 max-w-xl text-base text-muted-foreground text-pretty sm:text-lg">
                            Donde tus proyectos hablan por ti y las empresas encuentran talento real, probado y listo para crear.
                        </p>

                        {(showCreatorEntry || showCompanyEntry) && (
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                {showCreatorEntry && (
                                    <Button className="h-11 px-5 text-base shadow-[0_15px_30px_rgba(114,157,242,0.28)]" onClick={() => onEnter('creador')}>
                                        <GitBranch aria-hidden="true" />
                                        Soy creador
                                    </Button>
                                )}
                                {showCompanyEntry && (
                                    <Button variant="outline" className="h-11 border-primary/20 bg-white/80 px-5 text-base" onClick={() => onEnter('empresa')}>
                                        <Building2 aria-hidden="true" />
                                        Busco talento
                                    </Button>
                                )}
                            </div>
                        )}

                        <div className="mt-7 grid w-full max-w-lg gap-3 sm:grid-cols-3">
                            {[
                                { value: '+120', label: 'Perfiles activos' },
                                { value: '92%', label: 'Match promedio' },
                                { value: '24h', label: 'Respuesta media' },
                            ].map((stat) => (
                                <div key={stat.label} className="rounded-2xl border border-primary/10 bg-white/70 p-3 text-left shadow-sm">
                                    <p className="text-xl font-semibold text-foreground">{stat.value}</p>
                                    <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative flex min-h-[360px] items-center justify-center">
                        <div className="absolute inset-x-10 top-8 h-32 rounded-full bg-primary/12 blur-3xl" />
                        <div className="relative w-full max-w-md rounded-[30px] border border-primary/15 bg-white/90 p-5 shadow-[0_30px_80px_rgba(35,63,112,0.12)] backdrop-blur xl:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Perfil destacado</p>
                                    <h3 className="mt-2 text-2xl font-semibold">Valentina Ríos</h3>
                                </div>
                                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-link">Verificada</span>
                            </div>

                            <div className="mt-5 rounded-2xl bg-gradient-to-br from-primary/10 via-sky-100 to-white p-4">
                                <div className="flex items-center gap-3">
                                    <CreatorAvatar creator={featured[0]} className="size-14" />
                                    <div>
                                        <p className="font-medium">Full Stack Developer</p>
                                        <p className="text-sm text-muted-foreground">Java · React · MySQL</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {['Java', 'Spring', 'React', 'SQL'].map((tag) => (
                                        <span key={tag} className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-link ring-1 ring-primary/10">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl border border-border bg-slate-50 p-3">
                                    <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Proyectos</p>
                                    <p className="mt-2 text-xl font-semibold">12</p>
                                </div>
                                <div className="rounded-2xl border border-border bg-slate-50 p-3">
                                    <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Evidencia</p>
                                    <p className="mt-2 text-xl font-semibold">+8</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section aria-labelledby="featured-heading" className="flex flex-col gap-6">
                <div className="flex items-end justify-between gap-4">
                    <h2 id="featured-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
                        Creadores en Lumus
                    </h2>
                    <Button variant="ghost" onClick={() => onNavigate('explorar')}>
                        Explorar todos
                        <ArrowRight aria-hidden="true" />
                    </Button>
                </div>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {featured.map((c) => (
                        <li key={c.id} className="lumus-panel lumus-card-hover flex flex-col items-center gap-3 p-5 text-center">
                            <CreatorAvatar creator={c} className="size-16 ring-4 ring-primary/10" />
                            <div className="flex flex-col gap-1">
                                <p className="flex items-center justify-center gap-1.5 font-medium">
                                    {c.name}
                                    {c.verified && <VerifiedBadge />}
                                </p>
                                <p className="line-clamp-2 text-xs text-muted-foreground">{c.title}</p>
                            </div>
                            <p className="font-mono text-[11px] text-link">{c.languages.join(' · ')}</p>
                        </li>
                    ))}
                </ul>
            </section>

            <section aria-labelledby="features-heading" className="flex flex-col gap-6">
                <h2 id="features-heading" className="text-xl font-semibold tracking-tight sm:text-2xl">
                    ¿Por qué Lumus?
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                    {FEATURES.map(({ icon: Icon, title, body }) => (
                        <div key={title} className="lumus-panel lumus-card-hover flex flex-col gap-3 p-6">
                            <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-sky-200 text-link shadow-sm">
                                <Icon className="size-5" aria-hidden="true" />
                            </span>
                            <h3 className="text-lg font-semibold">{title}</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
