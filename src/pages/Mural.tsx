import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SendHorizonal, Loader2, Globe } from 'lucide-react';
import { containsProfanity } from '@/lib/profanityFilter';
import { sanitizeDisplayName } from '@/lib/sanitizeDisplayName';
import { edgeFunctionUrl, PUBLISHABLE_KEY } from '@/lib/authHeader';
import EcumenicalWall from '@/components/mural/EcumenicalWall';
import { FAB_SAFE_PADDING } from '@/components/fab/fabConfig';

export default function Mural() {
  const { user } = useApp();
  const { toast } = useToast();
  const [newPrayer, setNewPrayer] = useState('');
  const [posting, setPosting] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [preferredReligion, setPreferredReligion] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('display_name, preferred_religion').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => {
        setDisplayName(sanitizeDisplayName(data?.display_name));
        setPreferredReligion(data?.preferred_religion || null);
      });
  }, [user]);

  const moderateContent = useCallback(async (content: string): Promise<{ allowed: boolean; category: string; reason: string } | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(edgeFunctionUrl('moderate-post'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ content }),
      });
      if (resp.status === 429) {
        toast({ title: 'Muitas requisições', description: 'Aguarde alguns segundos.', variant: 'destructive' });
        return null;
      }
      if (resp.status === 402) {
        toast({ title: 'Moderação indisponível', description: 'Tente novamente mais tarde.', variant: 'destructive' });
        return null;
      }
      if (!resp.ok) return null;
      return await resp.json();
    } catch {
      return null;
    }
  }, [toast]);

  const handlePost = async () => {
    if (!newPrayer.trim() || !user) return;
    const text = newPrayer.trim();

    if (containsProfanity(text)) {
      toast({ title: 'Conteúdo bloqueado', description: 'Linguagem inadequada detectada.', variant: 'destructive' });
      await supabase.from('moderation_flags').insert({
        user_id: user.id, content: text, category: 'profanity', reason: 'Filtro local de palavrões',
      });
      return;
    }

    setPosting(true);
    try {
      const moderation = await moderateContent(text);
      if (moderation && !moderation.allowed) {
        toast({
          title: 'Conteúdo bloqueado',
          description: `${moderation.reason} O administrador foi notificado.`,
          variant: 'destructive',
        });
        await supabase.from('moderation_flags').insert({
          user_id: user.id,
          content: text,
          category: moderation.category,
          reason: moderation.reason,
        });
        return;
      }

      const { error } = await supabase.from('prayer_wall_posts').insert({
        user_id: user.id,
        content: text,
        display_name: displayName,
        is_anonymous: false,
        is_public: true,
        religion: preferredReligion,
      });
      if (error) throw error;
      setNewPrayer('');
      toast({ title: 'Oração publicada 🕊️', description: 'Que sua paz alcance todos.' });
    } catch (e: any) {
      toast({ title: 'Erro ao publicar', description: e.message, variant: 'destructive' });
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto ${FAB_SAFE_PADDING}`}>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Globe className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Pela Paz no Mundo</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Mural Ecumênico
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Um espaço sagrado para todas as tradições — onde a oração de cada um é a esperança de todos.
          </p>
        </div>

        {/* Composer */}
        {user && (
          <div className="rounded-2xl border border-border/50 bg-card p-4 space-y-3">
            <Textarea
              value={newPrayer}
              onChange={e => setNewPrayer(e.target.value.slice(0, 500))}
              placeholder="Compartilhe uma oração, intenção ou bênção pela paz..."
              className="min-h-[80px] max-h-[160px] resize-none text-sm rounded-xl bg-background border-border/50"
              rows={3}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">{newPrayer.length}/500 · Conteúdo moderado por IA</span>
              <Button
                onClick={handlePost}
                disabled={posting || !newPrayer.trim()}
                size="sm"
                className="bg-primary text-primary-foreground gap-1.5"
              >
                {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
                Publicar
              </Button>
            </div>
          </div>
        )}

        {/* Ecumenical Wall */}
        <EcumenicalWall />
      </div>
    </div>
  );
}
