'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLumus } from '@/lib/lumus/store';
import { isValidGithubUrl, sanitize } from '@/lib/lumus/format';
export function ProjectFormDialog({ open, onOpenChange }) {
    const { addProject } = useLumus();
    const [error, setError] = useState(null);
    function handleSubmit(event) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const title = sanitize(String(data.get('title') ?? ''));
        const description = sanitize(String(data.get('description') ?? ''));
        const repo = String(data.get('repo') ?? '').trim();
        const evidenceUrl = String(data.get('evidence') ?? '').trim();
        const tags = String(data.get('tags') ?? '')
            .split(',')
            .map((t) => sanitize(t))
            .filter(Boolean);
        if (!title || !description)
            return setError('El título y la descripción son obligatorios.');
        if (!isValidGithubUrl(repo))
            return setError('Ingresa una URL válida de GitHub (https://github.com/usuario/repo).');
        if (evidenceUrl && !/^https:\/\//.test(evidenceUrl))
            return setError('La URL de evidencia debe comenzar con https://');
        addProject({ title, description, repo, tags, evidenceUrl });
        setError(null);
        onOpenChange(false);
        toast.success('Proyecto publicado', { description: `"${title}" ya es visible en tu portafolio.` });
    }
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar nuevo proyecto</DialogTitle>
          <DialogDescription>Comparte evidencia real de tu trabajo para que las empresas te encuentren.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" placeholder="Ej. Sistema de reservas" required maxLength={80}/>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" placeholder="¿Qué problema resuelve y cómo lo construiste?" required maxLength={400}/>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="repo">Repositorio de GitHub</Label>
            <Input id="repo" name="repo" type="url" placeholder="https://github.com/usuario/proyecto" required/>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="tags">Tecnologías</Label>
            <Input id="tags" name="tags" placeholder="Java, MySQL, React"/>
            <p className="text-xs text-muted-foreground">Separadas por comas.</p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="evidence">URL de evidencia multimedia</Label>
            <Input id="evidence" name="evidence" type="url" placeholder="https://www.youtube.com/watch?v=..."/>
            <p className="text-xs text-muted-foreground">Video de YouTube/Vimeo o imagen JPG/PNG.</p>
          </div>
          {error && (<p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>)}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Publicar proyecto</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);
}
