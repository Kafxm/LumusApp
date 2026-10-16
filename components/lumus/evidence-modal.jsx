'use client';
import { ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getEmbedUrl, isImageUrl } from '@/lib/lumus/format';
export function EvidenceModal({ project, onOpenChange, }) {
    const embedUrl = project ? getEmbedUrl(project.evidenceUrl) : null;
    const isImage = project ? isImageUrl(project.evidenceUrl) : false;
    return (<Dialog open={project !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{project?.title ?? 'Evidencia'}</DialogTitle>
          <DialogDescription>Evidencia multimedia del proyecto</DialogDescription>
        </DialogHeader>
        {project && (<div className="overflow-hidden rounded-lg bg-black ring-1 ring-border">
            {embedUrl ? (<div className="aspect-video w-full">
                <iframe src={embedUrl} title={`Video de ${project.title}`} loading="lazy" className="size-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
              </div>) : isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.evidenceUrl} alt={`Captura de ${project.title}`} className="w-full" crossOrigin="anonymous"/>) : (<div className="flex aspect-video flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted-foreground">
                <p>Esta evidencia no se puede previsualizar dentro de Lumus.</p>
                {project.evidenceUrl && (<a href={project.evidenceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-link hover:underline">
                    Abrir enlace <ExternalLink className="size-3.5" aria-hidden="true"/>
                  </a>)}
              </div>)}
          </div>)}
        {project && <p className="text-sm text-muted-foreground">{project.description}</p>}
      </DialogContent>
    </Dialog>);
}
