import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
}

const REASONS = [
  { id: 'harassment', pt: 'Assédio', en: 'Harassment', es: 'Acoso' },
  { id: 'hate', pt: 'Incitação ao ódio', en: 'Hate speech', es: 'Discurso de odio' },
  { id: 'racism', pt: 'Racismo', en: 'Racism', es: 'Racismo' },
  { id: 'discrimination', pt: 'Discriminação religiosa', en: 'Religious discrimination', es: 'Discriminación religiosa' },
  { id: 'offensive', pt: 'Conteúdo ofensivo', en: 'Offensive content', es: 'Contenido ofensivo' },
  { id: 'spam', pt: 'Spam', en: 'Spam', es: 'Spam' },
  { id: 'other', pt: 'Outro', en: 'Other', es: 'Otro' },
];

export default function ReportDialog({ open, onOpenChange, postId }: ReportDialogProps) {
  const { language, user } = useApp();
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const labels = {
    title: language === 'en' ? 'Report Content' : language === 'es' ? 'Reportar Contenido' : 'Denunciar Conteúdo',
    desc: language === 'en' ? 'Select the reason(s) for reporting' : language === 'es' ? 'Selecciona el/los motivo(s)' : 'Selecione o(s) motivo(s) da denúncia',
    details: language === 'en' ? 'Additional details (optional)' : language === 'es' ? 'Detalles adicionales (opcional)' : 'Detalhes adicionais (opcional)',
    submit: language === 'en' ? 'Submit Report' : language === 'es' ? 'Enviar Reporte' : 'Enviar Denúncia',
    cancel: language === 'en' ? 'Cancel' : language === 'es' ? 'Cancelar' : 'Cancelar',
    success: language === 'en' ? 'Report submitted. Thank you.' : language === 'es' ? 'Reporte enviado. Gracias.' : 'Denúncia enviada. Obrigado.',
    error: language === 'en' ? 'Error submitting report' : language === 'es' ? 'Error al enviar' : 'Erro ao enviar denúncia',
    selectOne: language === 'en' ? 'Select at least one reason' : language === 'es' ? 'Selecciona al menos un motivo' : 'Selecione ao menos um motivo',
  };

  const toggleReason = (id: string) => {
    setSelectedReasons(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (!user || selectedReasons.length === 0) {
      toast.error(labels.selectOne);
      return;
    }
    setLoading(true);

    const { error } = await supabase.from('prayer_reports' as any).insert({
      post_id: postId,
      reporter_id: user.id,
      reason: selectedReasons.join(', '),
      details: details.trim() || null,
    } as any);

    setLoading(false);
    if (error) {
      toast.error(labels.error);
      return;
    }

    toast.success(labels.success);
    setSelectedReasons([]);
    setDetails('');
    onOpenChange(false);
  };

  const getLang = (r: typeof REASONS[0]) => language === 'en' ? r.en : language === 'es' ? r.es : r.pt;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>{labels.desc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {REASONS.map(reason => (
            <div key={reason.id} className="flex items-center gap-2">
              <Checkbox
                id={`reason-${reason.id}`}
                checked={selectedReasons.includes(reason.id)}
                onCheckedChange={() => toggleReason(reason.id)}
              />
              <Label htmlFor={`reason-${reason.id}`} className="text-sm cursor-pointer">
                {getLang(reason)}
              </Label>
            </div>
          ))}

          {selectedReasons.includes('other') && (
            <Textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder={labels.details}
              className="min-h-[60px] resize-none"
              maxLength={500}
            />
          )}
        </div>

        <div className="flex gap-2 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            {labels.cancel}
          </Button>
          <Button onClick={handleSubmit} disabled={loading || selectedReasons.length === 0} className="flex-1">
            {labels.submit}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
