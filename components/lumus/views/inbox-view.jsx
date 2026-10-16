'use client';
import { useState } from 'react';
import { ArrowLeft, Building2, Inbox, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useLumus } from '@/lib/lumus/store';
import { formatDate, sanitize } from '@/lib/lumus/format';
import { CreatorAvatar, EmptyState, SectionHeader } from '../shared';
export function InboxView() {
    const { state, replyThread, markThreadRead } = useLumus();
    const side = state.role === 'empresa' ? 'empresa' : 'creador';
    const [selectedId, setSelectedId] = useState(null);
    const [draft, setDraft] = useState('');
    const threads = state.threads.filter((t) => side === 'creador' ? t.creatorId === state.currentCreatorId : t.company === state.currentCompany);
    const selected = threads.find((t) => t.id === selectedId) ?? null;
    const isUnread = (t) => (side === 'creador' ? !t.readByCreator : !t.readByCompany);
    function openThread(id) {
        setSelectedId(id);
        setDraft('');
        markThreadRead(id, side);
    }
    function handleSend(event) {
        event?.preventDefault();
        const body = sanitize(draft);
        if (!selected || !body)
            return;
        replyThread(selected.id, body, side);
        setDraft('');
    }
    return (<div className="flex flex-col gap-6">
      <SectionHeader eyebrow="Mensajería" title="Buzón interno" description={side === 'creador'
            ? 'Oportunidades y propuestas que las empresas te envían.'
            : 'Conversaciones con los creadores que has contactado.'}/>

      {threads.length === 0 ? (<EmptyState icon={<Inbox className="size-5" aria-hidden="true"/>} title="Tu buzón está vacío" description="Cuando haya conversaciones aparecerán aquí."/>) : (<div className="grid min-h-[520px] overflow-hidden rounded-2xl border bg-card md:grid-cols-[320px_1fr]">
          <ul aria-label="Conversaciones" className={cn('flex flex-col divide-y border-r', selected && 'hidden md:flex')}>
            {threads.map((thread) => {
                const creator = state.creators.find((c) => c.id === thread.creatorId);
                const last = thread.messages[thread.messages.length - 1];
                const unread = isUnread(thread);
                return (<li key={thread.id}>
                  <button type="button" onClick={() => openThread(thread.id)} aria-current={thread.id === selectedId} className={cn('flex w-full gap-3 px-4 py-3.5 text-left outline-none transition-colors hover:bg-accent/60 focus-visible:bg-accent', thread.id === selectedId && 'bg-accent')}>
                    {side === 'empresa' && creator ? (<CreatorAvatar creator={creator} className="size-9"/>) : (<span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground">
                        <Building2 className="size-4" aria-hidden="true"/>
                      </span>)}
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex items-center justify-between gap-2">
                        <span className={cn('truncate text-sm', unread ? 'font-semibold' : 'font-medium')}>
                          {side === 'empresa' ? creator?.name : thread.company}
                        </span>
                        <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                          {formatDate(last.date)}
                        </span>
                      </span>
                      <span className="truncate text-xs text-foreground/80">{thread.subject}</span>
                      <span className="truncate text-xs text-muted-foreground">{last.body}</span>
                    </span>
                    {unread && (<span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary">
                        <span className="sr-only">No leído</span>
                      </span>)}
                  </button>
                </li>);
            })}
          </ul>

          <section className={cn('flex flex-col', !selected && 'hidden md:flex')} aria-label="Conversación">
            {selected ? (<>
                <header className="flex items-center gap-3 border-b px-4 py-3">
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedId(null)} aria-label="Volver a conversaciones">
                    <ArrowLeft aria-hidden="true"/>
                  </Button>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{selected.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {side === 'empresa'
                    ? state.creators.find((c) => c.id === selected.creatorId)?.name
                    : selected.company}
                    </p>
                  </div>
                </header>
                <ol className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                  {selected.messages.map((m) => {
                    const mine = m.from === side;
                    return (<li key={m.id} className={cn('flex max-w-[85%] flex-col gap-1', mine ? 'self-end items-end' : 'self-start')}>
                        <p className={cn('rounded-2xl px-4 py-2.5 text-sm leading-relaxed', mine ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm bg-secondary')}>
                          {m.body}
                        </p>
                        <time className="font-mono text-[10px] text-muted-foreground" dateTime={m.date}>
                          {formatDate(m.date, true)}
                        </time>
                      </li>);
                })}
                </ol>
                <form onSubmit={handleSend} className="flex items-end gap-2 border-t p-3">
                  <label htmlFor="reply" className="sr-only">
                    Escribe una respuesta
                  </label>
                  <Textarea id="reply" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        if (e.nativeEvent.isComposing || e.keyCode === 229)
                            return;
                        e.preventDefault();
                        handleSend();
                    }
                }} rows={1} maxLength={1000} placeholder="Escribe una respuesta…" className="min-h-9 resize-none"/>
                  <Button type="submit" size="icon-lg" disabled={!draft.trim()} aria-label="Enviar respuesta">
                    <Send aria-hidden="true"/>
                  </Button>
                </form>
              </>) : (<div className="grid flex-1 place-items-center p-6 text-sm text-muted-foreground">
                Selecciona una conversación
              </div>)}
          </section>
        </div>)}
    </div>);
}
