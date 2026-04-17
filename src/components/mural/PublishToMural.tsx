import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { containsProfanity } from '@/lib/profanityFilter';
import { sanitizeDisplayName } from '@/lib/sanitizeDisplayName';
import { ScrollText, Loader2, Globe, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface PublishToMuralProps {
  originalContent: string;
  variant?: 'icon' | 'button';
  className?: string;
}

export default function PublishToMural({ originalContent, variant = 'icon', className }: PublishToMuralProps) {
  const { language, user, chatContext, isSubscriber, isAdmin } = useApp();
  const hasAccess = isSubscriber || isAdmin;
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isEcumenical, setIsEcumenical] = useState(false);

  const religion = chatContext.religion || chatContext.philosophy || '';

  const handleOpen = async () => {
    if (!user) {
      toast({ title: t('auth.login', language), variant: 'destructive' });
      return;
    }
    if (!hasAccess) {
      toast({ title: t('chat.upgrade', language), description: t('chat.no_questions', language), variant: 'destructive' });
      return;
    }
    setOpen(true);
    setLoading(true);
    setSummary('');

    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sacred-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: `Resuma o seguinte conteúdo em até 500 caracteres para publicação em um mural sagrado. Mantenha a essência espiritual e inspiradora. Responda APENAS com o resumo, sem explicações:\n\n${originalContent.slice(0, 2000)}` },
          ],
          context: { religion: chatContext.religion || '', philosophy: chatContext.philosophy || '' },
          language,
          userId: user.id,
        }),
      });

      if (!resp.ok || !resp.body) throw new Error('Failed');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, idx);
          textBuffer = textBuffer.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) result += content;
          } catch { /* skip */ }
        }
      }

      setSummary(result.trim().slice(0, 500));
    } catch {
      setSummary(originalContent.slice(0, 500));
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!summary.trim()) return;
    if (containsProfanity(summary)) {
      toast({ title: t('mural.profanity_blocked', language) || 'Conteúdo inadequado detectado.', variant: 'destructive' });
      return;
    }
    setPublishing(true);
    try {
      const { error } = await supabase.from('prayer_wall_posts').insert({
        user_id: user!.id,
        content: summary.trim(),
        religion: isEcumenical ? null : (chatContext.religion || null),
        philosophy: isEcumenical ? null : (chatContext.philosophy || null),
        is_public: isEcumenical,
        is_anonymous: false,
        display_name: sanitizeDisplayName(user!.email?.split('@')[0]) || null,
      });
      if (error) throw error;
      toast({ title: t('mural.published', language) || 'Publicado no Mural! 🕊️' });
      setOpen(false);
    } catch (err: any) {
      toast({ title: t('chat.error', language), description: err.message, variant: 'destructive' });
    } finally {
      setPublishing(false);
    }
  };

  const label = t('mural.publish', language) || 'Publicar no Mural';

  return (
    <>
      {variant === 'icon' ? (
        <button
          onClick={handleOpen}
          className={cn(
            "p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors",
            className
          )}
          title={label}
        >
          <ScrollText className="h-4 w-4" />
        </button>
      ) : (
        <Button variant="outline" size="sm" onClick={handleOpen} className={cn("gap-1.5", className)}>
          <ScrollText className="h-3.5 w-3.5" />
          {label}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-primary" />
              {label}
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Gerando resumo...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Textarea
                value={summary}
                onChange={e => setSummary(e.target.value.slice(0, 500))}
                rows={5}
                className="text-sm"
                placeholder="Resumo para o mural..."
              />
              <p className="text-xs text-muted-foreground text-right">{summary.length}/500</p>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsEcumenical(false)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all",
                    !isEcumenical
                      ? "border-primary/40 bg-primary/10 text-primary sacred-glow"
                      : "border-primary/10 glass hover:border-primary/30 text-muted-foreground"
                  )}
                >
                  <Home className="h-4 w-4" />
                  {t('mural.my_temple', language) || 'Meu Templo'}
                </button>
                <button
                  onClick={() => setIsEcumenical(true)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all",
                    isEcumenical
                      ? "border-primary/40 bg-primary/10 text-primary sacred-glow"
                      : "border-primary/10 glass hover:border-primary/30 text-muted-foreground"
                  )}
                >
                  <Globe className="h-4 w-4" />
                  {t('mural.ecumenical', language) || 'Ecumênico'}
                </button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('learn.not_now', language) || 'Cancelar'}
            </Button>
            <Button
              onClick={handlePublish}
              disabled={loading || publishing || !summary.trim()}
              className="sacred-gradient text-primary-foreground"
            >
              {publishing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ScrollText className="h-4 w-4 mr-2" />}
              {t('mural.confirm', language) || 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
