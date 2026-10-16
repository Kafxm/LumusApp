import { BadgeCheck, Flame } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { initials } from '@/lib/lumus/format';
export function LumusLogo({ className }) {
    return (<span className={cn('flex items-center gap-2 font-semibold tracking-tight', className)}>
      <img src="/brand/lumus-mark.png" alt="" aria-hidden="true" width={32} height={32} className="size-8 rounded-lg shadow-sm ring-1 ring-primary/30"/>
      <span className="bg-gradient-to-r from-link to-primary bg-clip-text text-lg text-transparent">Lumus</span>
    </span>);
}
export function VerifiedBadge({ className }) {
    return (<span className={cn('inline-flex items-center text-info', className)} title="Cuenta verificada por Lumus">
      <BadgeCheck className="size-4" aria-hidden="true"/>
      <span className="sr-only">Verificado</span>
    </span>);
}
export function BoostBadge({ className }) {
    return (<span className={cn('inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-medium text-warning ring-1 ring-warning/30', className)}>
      <Flame className="size-3" aria-hidden="true"/>
      Destacado
    </span>);
}
export function CreatorAvatar({ creator, className }) {
    return (<Avatar className={cn('size-12', className)}>
      <AvatarImage src={creator.avatar || '/placeholder.svg'} alt={`Foto de ${creator.name}`}/>
      <AvatarFallback>{initials(creator.name)}</AvatarFallback>
    </Avatar>);
}
export function TechTag({ children, tone = 'default' }) {
    return (<span className={cn('inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[11px] ring-1', tone === 'db'
            ? 'bg-info/10 text-info ring-info/25'
            : 'bg-primary/10 text-link ring-primary/25')}>
      {children}
    </span>);
}
export function SectionHeader({ eyebrow, title, description, action, }) {
    return (<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        {eyebrow && <p className="font-mono text-xs uppercase tracking-widest text-link">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-muted-foreground text-pretty">{description}</p>}
      </div>
      {action}
    </div>);
}
export function EmptyState({ icon, title, description, action, }) {
    return (<div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">{icon}</div>
      <div className="flex flex-col gap-1">
        <p className="font-medium">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>);
}
export const selectClass = 'h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 [&>option]:bg-popover';
