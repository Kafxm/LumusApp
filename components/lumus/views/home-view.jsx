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
    return (<div className="flex flex-col gap-20 pb-8">
      <section className="relative flex flex-col items-center gap-8 pt-8 text-center sm:pt-16">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-24 -z-10 mx-auto h-96 max-w-3xl rounded-full bg-brand-sky/50 blur-3xl"/>
        <img src="/brand/lumus-logo.png" alt="Lumus" width={520} height={285} className="h-auto w-56 rounded-3xl shadow-lg shadow-primary/20 sm:w-72"/>
        <span className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <Sparkles className="size-3.5 text-link" aria-hidden="true"/>
          Proyecto Integrador · Ingeniería de Software
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
          Iluminando el{' '}
          <span className="bg-gradient-to-r from-link via-primary to-info bg-clip-text text-transparent">
            talento independiente
          </span>
        </h1>
        <p className="max-w-xl text-lg font-medium text-link text-pretty sm:text-xl">
          Donde tus proyectos hablan por ti.
        </p>
        <p className="max-w-xl text-base text-muted-foreground text-pretty">
          Lumus conecta desarrolladores autodidactas, técnicos e inventores con empresas que buscan habilidades
          comprobadas, no solo títulos.
        </p>
        {(showCreatorEntry || showCompanyEntry) && (
          <div className="flex flex-col gap-3 sm:flex-row">
            {showCreatorEntry && (
              <Button className="h-11 px-5 text-base" onClick={() => onEnter('creador')}>
                <GitBranch aria-hidden="true"/>
                Soy creador
              </Button>
            )}
            {showCompanyEntry && (
              <Button variant="outline" className="h-11 px-5 text-base" onClick={() => onEnter('empresa')}>
                <Building2 aria-hidden="true"/>
                Busco talento
              </Button>
            )}
          </div>
        )}
      </section>

      <section aria-labelledby="featured-heading" className="flex flex-col gap-6">
        <div className="flex items-end justify-between gap-4">
          <h2 id="featured-heading" className="text-xl font-semibold tracking-tight">
            Creadores en Lumus
          </h2>
          <Button variant="ghost" onClick={() => onNavigate('explorar')}>
            Explorar todos
            <ArrowRight aria-hidden="true"/>
          </Button>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((c) => (<li key={c.id} className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-5 text-center">
              <CreatorAvatar creator={c} className="size-16"/>
              <div className="flex flex-col gap-1">
                <p className="flex items-center justify-center gap-1.5 font-medium">
                  {c.name}
                  {c.verified && <VerifiedBadge />}
                </p>
                <p className="line-clamp-2 text-xs text-muted-foreground">{c.title}</p>
              </div>
              <p className="font-mono text-[11px] text-link">{c.languages.join(' · ')}</p>
            </li>))}
        </ul>
      </section>

      <section aria-labelledby="features-heading" className="flex flex-col gap-6">
        <h2 id="features-heading" className="text-xl font-semibold tracking-tight">
          ¿Por qué Lumus?
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (<div key={title} className="flex flex-col gap-3 rounded-2xl border bg-card p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-link">
                <Icon className="size-5" aria-hidden="true"/>
              </span>
              <h3 className="font-medium">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>))}
        </div>
      </section>
    </div>);
}
