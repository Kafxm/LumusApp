'use client';
import { useState } from 'react';
import { AlertTriangle, Eye, EyeOff, Flag, FolderGit2, LifeBuoy, RotateCcw, ShieldCheck, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useLumus } from '@/lib/lumus/store';
import { formatCOP, formatDate, sanitize } from '@/lib/lumus/format';
import { CreatorAvatar, SectionHeader, VerifiedBadge } from '../shared';
import { TicketStatus } from './support-view';
function StatCard({ label, value, icon, tone }) {
    return (<div className="flex items-center gap-4 rounded-2xl border bg-card p-4">
      <span className={cn('grid size-10 place-items-center rounded-xl', tone)}>{icon}</span>
      <div>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>);
}
export function AdminView() {
    const { state, setProjectHidden, toggleProjectFlag, toggleVerified, setTicketStatus, replyTicket, resetData } = useLumus();
    const [replyDrafts, setReplyDrafts] = useState({});
    const flagged = state.projects.filter((p) => p.flagged && p.status === 'active').length;
    const openTickets = state.tickets.filter((t) => t.status === 'Abierto').length;
    const revenue = state.invoices.filter((i) => i.status === 'Pagada').reduce((sum, i) => sum + i.amount, 0);
    const sortedProjects = [...state.projects].sort((a, b) => Number(b.flagged) - Number(a.flagged));
    function handleReply(ticketId) {
        const body = sanitize(replyDrafts[ticketId] ?? '');
        if (!body)
            return;
        replyTicket(ticketId, body, 'admin');
        setReplyDrafts((d) => ({ ...d, [ticketId]: '' }));
        toast.success('Respuesta enviada');
    }
    return (<div className="flex flex-col gap-8">
      <SectionHeader eyebrow="Módulo Administrador" title="Panel de control" description="Modera contenido, valida perfiles y gestiona los tickets de soporte de la plataforma." action={<Button variant="outline" onClick={() => {
                resetData();
                toast.success('Datos restablecidos', { description: 'La demo volvió a su estado inicial.' });
            }}>
            <RotateCcw aria-hidden="true"/>
            Restablecer demo
          </Button>}/>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Creadores" value={state.creators.length} icon={<Users className="size-5" aria-hidden="true"/>} tone="bg-primary/15 text-link"/>
        <StatCard label="Reportes pendientes" value={flagged} icon={<Flag className="size-5" aria-hidden="true"/>} tone="bg-destructive/15 text-destructive"/>
        <StatCard label="Tickets abiertos" value={openTickets} icon={<LifeBuoy className="size-5" aria-hidden="true"/>} tone="bg-warning/15 text-warning"/>
        <StatCard label="Ingresos (facturas pagadas)" value={formatCOP(revenue)} icon={<FolderGit2 className="size-5" aria-hidden="true"/>} tone="bg-success/15 text-success"/>
      </div>

      <Tabs defaultValue="moderacion" className="flex flex-col gap-4">
        <TabsList>
          <TabsTrigger value="moderacion">Moderación</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="moderacion">
          <div className="overflow-x-auto rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Proyecto</th>
                  <th scope="col" className="px-4 py-3 font-medium">Autor</th>
                  <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedProjects.map((p) => {
            const author = state.creators.find((c) => c.id === p.creatorId);
            return (<tr key={p.id} className={cn(p.flagged && p.status === 'active' && 'bg-destructive/5')}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {p.flagged && <AlertTriangle className="size-4 shrink-0 text-destructive" aria-label="Reportado"/>}
                          <div className="min-w-0">
                            <p className="truncate font-medium">{p.title}</p>
                            <p className="truncate text-xs text-muted-foreground">{p.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{author?.name}</td>
                      <td className="px-4 py-3">
                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', p.status === 'active' ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground')}>
                          {p.status === 'active' ? 'Visible' : 'Oculto'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => toggleProjectFlag(p.id)}>
                            <Flag aria-hidden="true"/>
                            {p.flagged ? 'Quitar reporte' : 'Reportar'}
                          </Button>
                          <Button variant={p.status === 'active' ? 'destructive' : 'secondary'} size="sm" onClick={() => {
                    setProjectHidden(p.id, p.status === 'active');
                    toast.success(p.status === 'active' ? 'Proyecto ocultado' : 'Proyecto restaurado', {
                        description: p.title,
                    });
                }}>
                            {p.status === 'active' ? <EyeOff aria-hidden="true"/> : <Eye aria-hidden="true"/>}
                            {p.status === 'active' ? 'Ocultar' : 'Restaurar'}
                          </Button>
                        </div>
                      </td>
                    </tr>);
        })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="usuarios">
          <ul className="grid gap-3 sm:grid-cols-2">
            {state.creators.map((c) => (<li key={c.id} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
                <CreatorAvatar creator={c} className="size-10"/>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate font-medium">
                    {c.name}
                    {c.verified && <VerifiedBadge />}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.location} · {state.projects.filter((p) => p.creatorId === c.id).length} proyectos
                  </p>
                </div>
                <Button variant={c.verified ? 'outline' : 'default'} size="sm" onClick={() => {
                toggleVerified(c.id);
                toast.success(c.verified ? 'Verificación retirada' : 'Perfil verificado', { description: c.name });
            }}>
                  <ShieldCheck aria-hidden="true"/>
                  {c.verified ? 'Quitar' : 'Verificar'}
                </Button>
              </li>))}
          </ul>
        </TabsContent>

        <TabsContent value="tickets">
          <ul className="flex flex-col gap-3">
            {state.tickets.map((t) => (<li key={t.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{t.trackingId}</span>
                  <TicketStatus status={t.status}/>
                  <span className="text-xs text-muted-foreground">
                    {t.user} · {formatDate(t.date)}
                  </span>
                  <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setTicketStatus(t.id, t.status === 'Abierto' ? 'Cerrado' : 'Abierto')}>
                    {t.status === 'Abierto' ? 'Marcar como cerrado' : 'Reabrir'}
                  </Button>
                </div>
                <div>
                  <p className="font-medium">{t.subject}</p>
                  <p className="text-sm text-muted-foreground">{t.description}</p>
                </div>
                {t.replies.map((r) => (<p key={r.id} className="rounded-lg border-l-2 border-primary bg-muted/50 px-3 py-2 text-sm">
                    {r.body}
                  </p>))}
                {t.status === 'Abierto' && (<div className="flex items-end gap-2">
                    <label htmlFor={`reply-${t.id}`} className="sr-only">
                      Responder ticket {t.trackingId}
                    </label>
                    <Textarea id={`reply-${t.id}`} rows={1} value={replyDrafts[t.id] ?? ''} onChange={(e) => setReplyDrafts((d) => ({ ...d, [t.id]: e.target.value }))} placeholder="Escribe una respuesta para el usuario…" className="min-h-9 resize-none"/>
                    <Button onClick={() => handleReply(t.id)} disabled={!replyDrafts[t.id]?.trim()} className="h-9">
                      Responder
                    </Button>
                  </div>)}
              </li>))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>);
}
