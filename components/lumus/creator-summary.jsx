import { GitBranch, MapPin } from 'lucide-react';
import { BoostBadge, CreatorAvatar, TechTag, VerifiedBadge } from './shared';
export function CreatorSummary({ creator, actions }) {
    return (<div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <CreatorAvatar creator={creator} className="size-20 ring-2 ring-primary/30"/>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight">{creator.name}</h2>
            {creator.verified && <VerifiedBadge />}
            {creator.boosted && <BoostBadge />}
          </div>
          <p className="text-sm text-foreground/80">{creator.title}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden="true"/>
              {creator.location}
            </span>
            {creator.github && (
              <a href={creator.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-link hover:underline">
                <GitBranch className="size-3.5" aria-hidden="true"/>
                {creator.github.replace('https://', '')}
              </a>
            )}
          </div>
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{creator.bio}</p>
      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Habilidades</dt>
          <dd className="flex flex-wrap gap-1.5">
            {creator.skills.map((s) => (<span key={s} className="rounded-md bg-secondary px-2 py-0.5 text-xs">
                {s}
              </span>))}
          </dd>
        </div>
        <div className="flex flex-col gap-2">
          <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Lenguajes</dt>
          <dd className="flex flex-wrap gap-1.5">
            {creator.languages.map((l) => (<TechTag key={l}>{l}</TechTag>))}
          </dd>
        </div>
        <div className="flex flex-col gap-2">
          <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Bases de datos</dt>
          <dd className="flex flex-wrap gap-1.5">
            {creator.databases.map((d) => (<TechTag key={d} tone="db">
                {d}
              </TechTag>))}
          </dd>
        </div>
      </dl>
    </div>);
}
