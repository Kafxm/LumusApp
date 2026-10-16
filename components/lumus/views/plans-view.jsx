'use client';
import { useState } from 'react';
import { Check, CreditCard, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useLumus } from '@/lib/lumus/store';
import { formatCOP, formatDate } from '@/lib/lumus/format';
import { SectionHeader } from '../shared';
function downloadInvoice(invoice, customer) {
    const content = [
        'Lumus S.A.S. — Factura electrónica',
        '====================================',
        `Factura:   ${invoice.id}`,
        `Fecha:     ${formatDate(invoice.date)}`,
        `Cliente:   ${customer}`,
        `Concepto:  Suscripción ${invoice.plan}`,
        `Total:     ${formatCOP(invoice.amount)}`,
        `Estado:    ${invoice.status}`,
        '',
        'Gracias por confiar en Lumus.',
    ].join('\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
}
const STATUS_STYLES = {
    Pagada: 'bg-success/15 text-success',
    Pendiente: 'bg-warning/15 text-warning',
    Fallida: 'bg-destructive/15 text-destructive',
};
export function PlansView({ onRequireCreator }) {
    const { state, subscribe, cancelSubscription } = useLumus();
    const [checkout, setCheckout] = useState(null);
    const [processing, setProcessing] = useState(false);
    const isCreator = state.role === 'creador';
    const creator = state.creators.find((c) => c.id === state.currentCreatorId);
    function handleChoose(plan) {
        if (!isCreator)
            return onRequireCreator();
        if (plan.price === 0) {
            if (state.premium) {
                cancelSubscription();
                toast.info('Suscripción cancelada', { description: 'Volviste al plan Gratis.' });
            }
            return;
        }
        setCheckout(plan);
    }
    function handlePay(event) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const card = String(data.get('card') ?? '').replace(/\s/g, '');
        if (!/^\d{16}$/.test(card)) {
            toast.error('Tarjeta inválida', { description: 'Ingresa los 16 dígitos de la tarjeta de prueba.' });
            return;
        }
        setProcessing(true);
        window.setTimeout(() => {
            subscribe(checkout.id);
            setProcessing(false);
            setCheckout(null);
            toast.success('¡Pago aprobado!', { description: 'Tu perfil ahora aparece como Destacado en el catálogo.' });
        }, 1400);
    }
    return (<div className="flex flex-col gap-10">
      <SectionHeader eyebrow="Suscripciones" title="Planes para creadores" description="Empieza gratis. Mejora a Premium Boost para posicionarte primero frente a reclutadores."/>

      <div className="grid gap-5 md:grid-cols-2">
        {state.plans.map((plan) => {
            const current = isCreator && (plan.price === 0 ? !state.premium : state.premium);
            return (<article key={plan.id} className={cn('relative flex flex-col gap-6 rounded-2xl border bg-card p-6', plan.highlighted && 'border-primary/50 bg-gradient-to-b from-primary/10 to-card')}>
              {plan.highlighted && (<span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                  Recomendado
                </span>)}
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">{plan.name}</h2>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <p className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight">{formatCOP(plan.price)}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </p>
              <ul className="flex flex-col gap-2.5">
                {plan.features.map((f) => (<li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true"/>
                    {f}
                  </li>))}
              </ul>
              <Button className="mt-auto h-10" variant={plan.highlighted ? 'default' : 'outline'} disabled={current} onClick={() => handleChoose(plan)}>
                {current ? 'Plan actual' : plan.price === 0 ? (state.premium && isCreator ? 'Cambiar a Gratis' : 'Comenzar gratis') : 'Mejorar a Premium'}
              </Button>
            </article>);
        })}
      </div>

      {isCreator && (<section aria-labelledby="billing-heading" className="flex flex-col gap-4">
          <h2 id="billing-heading" className="text-lg font-medium">
            Historial de facturación
          </h2>
          <div className="overflow-x-auto rounded-2xl border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Factura</th>
                  <th scope="col" className="px-4 py-3 font-medium">Fecha</th>
                  <th scope="col" className="px-4 py-3 font-medium">Plan</th>
                  <th scope="col" className="px-4 py-3 font-medium">Monto</th>
                  <th scope="col" className="px-4 py-3 font-medium">Estado</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {state.invoices.map((inv) => (<tr key={inv.id}>
                    <td className="px-4 py-3 font-mono text-xs">{inv.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(inv.date)}</td>
                    <td className="px-4 py-3">{inv.plan}</td>
                    <td className="px-4 py-3 font-mono">{formatCOP(inv.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STATUS_STYLES[inv.status])}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" disabled={inv.status !== 'Pagada'} onClick={() => downloadInvoice(inv, creator?.name ?? 'Cliente')}>
                        <Download aria-hidden="true"/>
                        Descargar
                      </Button>
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>
        </section>)}

      <Dialog open={checkout !== null} onOpenChange={(open) => !open && !processing && setCheckout(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pasarela de pago (simulada)</DialogTitle>
            <DialogDescription>
              {checkout?.name} · {checkout && formatCOP(checkout.price)} {checkout?.period}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePay} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="card">Número de tarjeta</Label>
              <div className="relative">
                <CreditCard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true"/>
                <Input id="card" name="card" inputMode="numeric" autoComplete="cc-number" defaultValue="4242 4242 4242 4242" className="pl-9 font-mono"/>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="exp">Vencimiento</Label>
                <Input id="exp" name="exp" defaultValue="12/28" autoComplete="cc-exp" className="font-mono"/>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" name="cvc" defaultValue="123" autoComplete="cc-csc" className="font-mono"/>
              </div>
            </div>
            <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              Entorno de prueba: no se realizará ningún cobro real.
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCheckout(null)} disabled={processing}>
                Cancelar
              </Button>
              <Button type="submit" disabled={processing}>
                {processing && <Loader2 className="animate-spin" aria-hidden="true"/>}
                {processing ? 'Procesando…' : `Pagar ${checkout ? formatCOP(checkout.price) : ''}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>);
}
