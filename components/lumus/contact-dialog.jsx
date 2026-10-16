'use client';
import { useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLumus } from '@/lib/lumus/store';
import { sanitize } from '@/lib/lumus/format';
export function ContactDialog({ creator, onOpenChange, }) {
    const { startThread, state } = useLumus();
    const lastSent = useRef(0);
    function handleSubmit(event) {
        event.preventDefault();
        if (!creator)
            return;
        const data = new FormData(event.currentTarget);
        if (data.get('website'))
            return;
        const subject = sanitize(String(data.get('subject') ?? ''));
        const body = sanitize(String(data.get('body') ?? ''));
        if (subject.length < 3 || body.length < 10) {
            toast.error('Mensaje incompleto', { description: 'Agrega un asunto y un mensaje de al menos 10 caracteres.' });
            return;
        }
        if (Date.now() - lastSent.current < 10_000) {
            toast.warning('Espera un momento', { description: 'Protección anti-spam: intenta de nuevo en unos segundos.' });
            return;
        }
        lastSent.current = Date.now();
        startThread(creator.id, subject, body);
        onOpenChange(false);
        toast.success('Mensaje enviado', { description: `${creator.name} lo recibirá en su buzón interno.` });
    }
    return (<Dialog open={creator !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Contactar a {creator?.name}</DialogTitle>
          <DialogDescription>
            Enviando como <span className="text-foreground">{state.currentCompany}</span>. El mensaje llegará a su buzón
            interno.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="subject">Asunto</Label>
            <Input id="subject" name="subject" placeholder="Oportunidad laboral / Licencia de proyecto" maxLength={90}/>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="body">Mensaje</Label>
            <Textarea id="body" name="body" rows={5} maxLength={1000} placeholder="Cuéntale sobre la oportunidad, el stack y los siguientes pasos."/>
          </div>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true"/>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Enviar mensaje</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);
}
