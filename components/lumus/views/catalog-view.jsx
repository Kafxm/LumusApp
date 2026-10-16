'use client';
import { useMemo, useState } from 'react';
import { Heart, Search, SearchX, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLumus } from '@/lib/lumus/store';
import { DATABASES, LANGUAGES } from '@/lib/lumus/seed';
import { ContactDialog } from '../contact-dialog';
import { CreatorSummary } from '../creator-summary';
import { EvidenceModal } from '../evidence-modal';
import { ProjectCard } from '../project-card';
import { EmptyState, SectionHeader, selectClass } from '../shared';
import { TalentCard } from '../talent-card';
const COPY = {
    catalogo: {
        eyebrow: 'Módulo Empresa',
        title: 'Catálogo de talento',
        description: 'Filtra creadores por lenguaje y base de datos. Los perfiles destacados aparecen primero.',
    },
    favoritos: {
        eyebrow: 'Módulo Empresa',
        title: 'Talento guardado',
        description: 'Los creadores que marcaste como favoritos para revisar o contactar más tarde.',
    },
    explorar: {
        eyebrow: 'Explorar',
        title: 'Talento validado por evidencia',
        description: 'Navega perfiles públicos. Inicia sesión como empresa para guardar favoritos y contactar.',
    },
};
export function CatalogView({ mode, onRequireCompany }) {
    const { state, toggleFavorite } = useLumus();
    const [query, setQuery] = useState('');
    const [language, setLanguage] = useState('');
    const [database, setDatabase] = useState('');
    const [contact, setContact] = useState(null);
    const [detail, setDetail] = useState(null);
    const [evidence, setEvidence] = useState(null);
    const isCompany = state.role === 'empresa';
    const activeProjects = useMemo(() => state.projects.filter((p) => p.status === 'active'), [state.projects]);
    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        return state.creators
            .filter((c) => (mode === 'favoritos' ? state.favorites.includes(c.id) : true))
            .filter((c) => (language ? c.languages.includes(language) : true))
            .filter((c) => (database ? c.databases.includes(database) : true))
            .filter((c) => q
            ? [c.name, c.title, ...c.skills, ...c.languages].some((field) => field.toLowerCase().includes(q))
            : true)
            .sort((a, b) => Number(b.boosted) - Number(a.boosted) || Number(b.verified) - Number(a.verified));
    }, [state.creators, state.favorites, mode, language, database, query]);
    const hasFilters = Boolean(query || language || database);
    function handleFavorite(creator) {
        if (!isCompany)
            return onRequireCompany();
        const added = toggleFavorite(creator.id);
        toast.success(added ? 'Añadido a favoritos' : 'Eliminado de favoritos', { description: creator.name });
    }
    function handleContact(creator) {
        if (!isCompany)
            return onRequireCompany();
        setContact(creator);
    }
    const copy = COPY[mode];
    const detailProjects = detail ? activeProjects.filter((p) => p.creatorId === detail.id) : [];
    return (<div className="flex flex-col gap-6">
      <SectionHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description}/>

      <form role="search" onSubmit={(e) => e.preventDefault()} className="grid gap-3 rounded-2xl border bg-card p-4 sm:grid-cols-[1fr_180px_180px_auto] sm:items-end">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="search" className="text-xs text-muted-foreground">
            Buscar
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true"/>
            <Input id="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nombre, habilidad o tecnología" className="h-9 pl-9"/>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="language" className="text-xs text-muted-foreground">
            Lenguaje
          </Label>
          <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} className={selectClass}>
            <option value="">Todos</option>
            {LANGUAGES.map((l) => (<option key={l} value={l}>
                {l}
              </option>))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="database" className="text-xs text-muted-foreground">
            Base de datos
          </Label>
          <select id="database" value={database} onChange={(e) => setDatabase(e.target.value)} className={selectClass}>
            <option value="">Todas</option>
            {DATABASES.map((d) => (<option key={d} value={d}>
                {d}
              </option>))}
          </select>
        </div>
        <Button type="button" variant="ghost" className="h-9" disabled={!hasFilters} onClick={() => {
            setQuery('');
            setLanguage('');
            setDatabase('');
        }}>
          <X aria-hidden="true"/>
          Limpiar
        </Button>
      </form>

      <p className="text-sm text-muted-foreground" aria-live="polite">
        {results.length} {results.length === 1 ? 'creador encontrado' : 'creadores encontrados'}
      </p>

      {results.length === 0 ? (mode === 'favoritos' && !hasFilters ? (<EmptyState icon={<Heart className="size-5" aria-hidden="true"/>} title="Aún no tienes favoritos" description="Marca el corazón en cualquier perfil del catálogo para guardarlo aquí."/>) : (<EmptyState icon={<SearchX className="size-5" aria-hidden="true"/>} title="Sin resultados" description="Prueba con otro lenguaje o base de datos, o limpia los filtros."/>)) : (<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((creator) => (<TalentCard key={creator.id} creator={creator} projectCount={activeProjects.filter((p) => p.creatorId === creator.id).length} isFavorite={isCompany && state.favorites.includes(creator.id)} onToggleFavorite={() => handleFavorite(creator)} onContact={() => handleContact(creator)} onView={() => setDetail(creator)}/>))}
        </div>)}

      <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Perfil de {detail?.name}</DialogTitle>
            <DialogDescription>Portafolio público del creador</DialogDescription>
          </DialogHeader>
          {detail && (<div className="flex flex-col gap-6">
              <CreatorSummary creator={detail} actions={<Button size="sm" className="mr-8" onClick={() => {
                      const creator = detail;
                      setDetail(null);
                      handleContact(creator);
                  }}>
                    Contactar
                  </Button>}/>
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-medium">Proyectos ({detailProjects.length})</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {detailProjects.map((p) => (<ProjectCard key={p.id} project={p} onViewEvidence={setEvidence}/>))}
                </div>
              </div>
            </div>)}
        </DialogContent>
      </Dialog>

      <ContactDialog creator={contact} onOpenChange={(open) => !open && setContact(null)}/>
      <EvidenceModal project={evidence} onOpenChange={(open) => !open && setEvidence(null)}/>
    </div>);
}
