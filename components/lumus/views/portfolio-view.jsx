'use client';
import { useState } from 'react';
import { FolderPlus, Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLumus } from '@/lib/lumus/store';
import { isValidGithubUrl, sanitize } from '@/lib/lumus/format';
import { CreatorSummary } from '../creator-summary';
import { EvidenceModal } from '../evidence-modal';
import { ProjectCard } from '../project-card';
import { ProjectFormDialog } from '../project-form-dialog';
import { EmptyState, SectionHeader } from '../shared';
const FREE_PROJECT_LIMIT = 3;

function parseCommaSeparatedValues(value) {
    return [...new Set(value.split(',').map((item) => sanitize(item)).filter(Boolean))];
}

export function PortfolioView({ onUpgrade }) {
    const { state, updateProfile } = useLumus();
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [evidence, setEvidence] = useState(null);
    const creator = state.creators.find((c) => c.id === state.currentCreatorId);
    if (!creator)
        return null;
    const projects = state.projects.filter((p) => p.creatorId === creator.id && p.status === 'active');
    function handleNewProject() {
        if (!state.premium && projects.length >= FREE_PROJECT_LIMIT) {
            toast.info('Límite del plan Gratis', {
                description: 'Mejora a Premium Boost para publicar proyectos ilimitados.',
                action: { label: 'Ver planes', onClick: onUpgrade },
            });
            return;
        }
        setFormOpen(true);
    }
    function handleSaveProfile(event) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const github = String(data.get('github') ?? '').trim();
        if (github && !isValidGithubUrl(github)) {
            toast.error('URL de GitHub inválida', { description: 'Usa el formato https://github.com/usuario' });
            return;
        }
        updateProfile({
            title: sanitize(String(data.get('title') ?? '')) || creator.title,
            bio: sanitize(String(data.get('bio') ?? '')) || creator.bio,
            location: sanitize(String(data.get('location') ?? '')) || 'Por definir',
            github,
            skills: parseCommaSeparatedValues(String(data.get('skills') ?? '')),
            languages: parseCommaSeparatedValues(String(data.get('languages') ?? '')),
            databases: parseCommaSeparatedValues(String(data.get('databases') ?? '')),
        });
        setEditing(false);
        toast.success('Perfil actualizado');
    }
    return (<div className="flex flex-col gap-8">
      <SectionHeader eyebrow="Módulo Creador" title="Mi portafolio" description="Tu reputación se construye con evidencia. Mantén tu perfil y proyectos actualizados." action={<Button onClick={handleNewProject} className="h-9 px-3">
            <Plus aria-hidden="true"/>
            Nuevo proyecto
          </Button>}/>

      <section aria-label="Perfil público" className="rounded-2xl border bg-card p-5 sm:p-6">
        {editing ? (<form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            <h2 className="font-medium">Editar perfil público</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-title">Titular profesional</Label>
                <Input id="profile-title" name="title" defaultValue={creator.title} maxLength={80}/>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-location">Lugar de residencia</Label>
                <Input id="profile-location" name="location" defaultValue={creator.location === 'Por definir' ? '' : creator.location} placeholder="Medellín, Colombia" maxLength={80}/>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-github">Perfil de GitHub</Label>
                <Input id="profile-github" name="github" type="url" defaultValue={creator.github} placeholder="Opcional: https://github.com/usuario"/>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-skills">Habilidades</Label>
                <Input id="profile-skills" name="skills" defaultValue={creator.skills.join(', ')} placeholder="React, Diseño UI, Comunicación"/>
                <p className="text-xs text-muted-foreground">Separa cada habilidad con una coma.</p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-languages">Lenguajes</Label>
                <Input id="profile-languages" name="languages" defaultValue={creator.languages.join(', ')} placeholder="JavaScript, Python"/>
                <p className="text-xs text-muted-foreground">Separa cada lenguaje con una coma.</p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="profile-databases">Bases de datos</Label>
                <Input id="profile-databases" name="databases" defaultValue={creator.databases.join(', ')} placeholder="PostgreSQL, MongoDB"/>
                <p className="text-xs text-muted-foreground">Separa cada base de datos con una coma.</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="profile-bio">Biografía</Label>
              <Textarea id="profile-bio" name="bio" defaultValue={creator.bio} rows={4} maxLength={500}/>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar cambios</Button>
            </div>
          </form>) : (<CreatorSummary creator={creator} actions={<Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Pencil aria-hidden="true"/>
                Editar
              </Button>}/>)}
      </section>

      <section aria-labelledby="projects-heading" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 id="projects-heading" className="text-lg font-medium">
            Proyectos <span className="font-mono text-sm text-muted-foreground">({projects.length})</span>
          </h2>
          {!state.premium && (<p className="text-xs text-muted-foreground">
              {projects.length}/{FREE_PROJECT_LIMIT} en plan Gratis
            </p>)}
        </div>
        {projects.length === 0 ? (<EmptyState icon={<FolderPlus className="size-5" aria-hidden="true"/>} title="Aún no tienes proyectos" description="Publica tu primer proyecto con enlace al repositorio y evidencia en video." action={<Button onClick={handleNewProject}>Registrar proyecto</Button>}/>) : (<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (<ProjectCard key={project.id} project={project} onViewEvidence={setEvidence}/>))}
          </div>)}
      </section>

      <ProjectFormDialog open={formOpen} onOpenChange={setFormOpen}/>
      <EvidenceModal project={evidence} onOpenChange={(open) => !open && setEvidence(null)}/>
    </div>);
}
