import { Code2, GitBranch, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TechTag } from './shared';
import { formatDate } from '@/lib/lumus/format';
export function ProjectCard({ project, onViewEvidence }) {
    return (<article className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary/40">
      <button type="button" onClick={() => onViewEvidence(project)} disabled={!project.evidenceUrl} className="relative grid aspect-[16/8] place-items-center overflow-hidden bg-gradient-to-br from-primary/25 via-accent to-info/20 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default">
        <Code2 className="size-10 text-foreground/25" aria-hidden="true"/>
        {project.evidenceUrl && (<span className="absolute inset-0 grid place-items-center bg-background/0 transition-colors group-hover:bg-background/40">
            <span className="flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 text-xs font-medium opacity-90 ring-1 ring-border backdrop-blur group-hover:opacity-100">
              <PlayCircle className="size-4 text-link" aria-hidden="true"/>
              Ver evidencia
            </span>
          </span>)}
        <span className="sr-only">Ver evidencia de {project.title}</span>
      </button>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium leading-tight">{project.title}</h3>
          <time className="shrink-0 font-mono text-[11px] text-muted-foreground" dateTime={project.createdAt}>
            {formatDate(project.createdAt)}
          </time>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (<TechTag key={tag}>{tag}</TechTag>))}
        </div>
        <div className="mt-auto flex items-center gap-2 pt-1">
          <a href={project.repo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <GitBranch className="size-3.5" aria-hidden="true"/>
            Repositorio
          </a>
          {project.evidenceUrl && (<Button size="sm" variant="ghost" className="ml-auto" onClick={() => onViewEvidence(project)}>
              <PlayCircle aria-hidden="true"/>
              Evidencia
            </Button>)}
        </div>
      </div>
    </article>);
}
