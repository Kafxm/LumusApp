'use client';
import { useState } from 'react';
import { LifeBuoy, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useLumus } from '@/lib/lumus/store';
import { formatDate, sanitize } from '@/lib/lumus/format';
import { SectionHeader } from '../shared';
export function TicketStatus({ status }) {
    return (<span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', status === 'Abierto' ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success')}>
      {status}
    </span>);
}
export function SupportView() {
    const { state, createTicket } = useLumus();
    const [tracking, setTracking] = useState('');
    const [lookup, setLookup] = useState(null);
    const userName = state.role === 'empresa'
        ? state.currentCompany
        : (state.creators.find((c) => c.id === state.currentCreatorId)?.name ?? 'Usuario');
    const myTickets = state.tickets.filter((t) => t.user === userName);
    function handleCreate(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const subject = sanitize(String(data.get('subject') ?? ''));
        const description = sanitize(String(data.get('description') ?? ''));
        if (subject.length < 4 || description.length < 10) {
            toast.error('Completa el formulario', { description: 'Describe tu problema con más detalle.' });
            return;
        }
        const ticket = createTicket(subject, description, userName);
        form.reset();
        setTracking(ticket.trackingId);
        setLookup(ticket);
        toast.success('Ticket creado', { description: `Tu ID de seguimiento es ${ticket.trackingId}` });
    }
    function handleLookup(event) {
        event.preventDefault();
        const found = state.tickets.find((t) => t.trackingId.toLowerCase() === tracking.trim().toLowerCase());
        setLookup(found ?? 'not-found');
    }
    const lookupTicket = lookup && lookup !== 'not-found' ? state.tickets.find((t) => t.id === lookup.id) : null;
    return (<div className="flex flex-col gap-8">
      <SectionHeader eyebrow="Soporte técnico" title="Centro de ayuda" description="Reporta un problema y haz seguimiento con tu ID de ticket."/>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleCreate} className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
          <h2 className="flex items-center gap-2 font-medium">
            <LifeBuoy className="size-4 text-link" aria-hidden="true"/>
            Nuevo ticket
          </h2>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ticket-subject">Asunto</Label>
            <Input id="ticket-subject" name="subject" placeholder="Ej. Error al cargar evidencia" maxLength={90}/>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ticket-description">Descripción</Label>
            <Textarea id="ticket-description" name="description" rows={5} maxLength={1000} placeholder="¿Qué ocurrió? ¿Qué pasos seguiste?"/>
          </div>
          <Button type="submit" className="self-start">
            Enviar ticket
          </Button>
        </form>

        <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
          <h2 className="flex items-center gap-2 font-medium">
            <Search className="size-4 text-link" aria-hidden="true"/>
            Consultar estado
          </h2>
          <form onSubmit={handleLookup} className="flex gap-2">
            <label htmlFor="tracking" className="sr-only">
              ID de seguimiento
            </label>
            <Input id="tracking" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="LUM-4821" className="h-9 font-mono"/>
            <Button type="submit" variant="secondary" className="h-9">
              Buscar
            </Button>
          </form>
          <div aria-live="polite">
            {lookup === 'not-found' && (<p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                No encontramos un ticket con ese ID.
              </p>)}
            {lookupTicket && (<div className="flex flex-col gap-3 rounded-xl bg-muted/50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{lookupTicket.trackingId}</span>
                  <TicketStatus status={lookupTicket.status}/>
                </div>
                <p className="font-medium">{lookupTicket.subject}</p>
                <p className="text-sm text-muted-foreground">{lookupTicket.description}</p>
                {lookupTicket.replies.map((r) => (<div key={r.id} className="rounded-lg border-l-2 border-primary bg-card px-3 py-2 text-sm">
                    <p className="mb-1 text-xs text-link">Soporte Lumus · {formatDate(r.date)}</p>
                    {r.body}
                  </div>))}
              </div>)}
          </div>
          {myTickets.length > 0 && (<div className="flex flex-col gap-2 border-t pt-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Mis tickets</p>
              <ul className="flex flex-col gap-1">
                {myTickets.map((t) => (<li key={t.id}>
                    <button type="button" onClick={() => {
                    setTracking(t.trackingId);
                    setLookup(t);
                }} className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent">
                      <span className="truncate">
                        <span className="mr-2 font-mono text-xs text-muted-foreground">{t.trackingId}</span>
                        {t.subject}
                      </span>
                      <TicketStatus status={t.status}/>
                    </button>
                  </li>))}
              </ul>
            </div>)}
        </div>
      </div>
    </div>);
}
