import { FolderGit2, Heart, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BoostBadge, CreatorAvatar, TechTag, VerifiedBadge } from './shared';
export function TalentCard({ creator, projectCount, isFavorite, onToggleFavorite, onContact, onView, }) {
    return (<article className={cn('relative flex flex-col gap-4 rounded-2xl border bg-card p-5 transition-colors hover:border-primary/40', creator.boosted && 'border-warning/30 bg-gradient-to-b from-warning/[0.06] to-card')}>
      <div className="flex items-start gap-3">
        <CreatorAvatar creator={creator}/>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-medium">
              <button type="button" onClick={onView} className="text-left outline-none after:absolute after:inset-0 after:rounded-2xl hover:text-link focus-visible:text-link">
                {creator.name}
              </button>
            </h3>
            {creator.verified && <VerifiedBadge />}
          </div>
          <p className="line-clamp-1 text-xs text-muted-foreground">{creator.title}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onToggleFavorite} aria-pressed={isFavorite} aria-label={isFavorite ? `Quitar a ${creator.name} de favoritos` : `Añadir a ${creator.name} a favoritos`} className="relative z-10 -mr-1 -mt-1">
          <Heart className={cn('size-4', isFavorite && 'fill-destructive text-destructive')} aria-hidden="true"/>
        </Button>
      </div>

      {creator.boosted && <BoostBadge className="self-start"/>}

      <div className="flex flex-wrap gap-1.5">
        {creator.languages.map((l) => (<TechTag key={l}>{l}</TechTag>))}
        {creator.databases.map((d) => (<TechTag key={d} tone="db">
            {d}
          </TechTag>))}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 border-t pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <FolderGit2 className="size-3.5" aria-hidden="true"/>
          {projectCount} {projectCount === 1 ? 'proyecto' : 'proyectos'}
        </span>
        <Button size="sm" onClick={onContact} className="relative z-10">
          <MessageSquare aria-hidden="true"/>
          Contactar
        </Button>
      </div>
    </article>);
}
