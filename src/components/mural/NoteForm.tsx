import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Send, Eye, EyeOff, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { containsProfanity } from '@/lib/profanityFilter';

interface NoteFormProps {
  religion?: string;
  philosophy?: string;
  onCreated: () => void;
}

export default function NoteForm({ religion, philosophy, onCreated }: NoteFormProps) {
  const { language, user } = useApp();
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || !user) return;

    // Profanity check
    if (containsProfanity(content)) {
      toast.error(
        language === 'en'
          ? 'Your message contains inappropriate language. Please revise it before posting.'
          : language === 'es'
            ? 'Tu mensaje contiene lenguaje inapropiado. Por favor revísalo antes de publicar.'
            : 'Sua mensagem contém linguagem inapropriada. Por favor, revise antes de publicar.'
      );
      return;
    }

    setLoading(true);

    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .maybeSingle();

    const { error } = await supabase.from('prayer_wall_posts').insert({
      user_id: user.id,
      content: content.trim(),
      religion: religion || null,
      philosophy: philosophy || null,
      is_anonymous: isAnonymous,
      is_public: isPublic,
      display_name: isAnonymous ? null : (profile?.display_name || user.email?.split('@')[0] || null),
    });

    setLoading(false);

    if (error) {
      toast.error(language === 'en' ? 'Error posting note' : language === 'es' ? 'Error al publicar' : 'Erro ao publicar bilhete');
      return;
    }

    setContent('');
    setIsAnonymous(false);
    setIsPublic(false);
    onCreated();
    toast.success(
      language === 'en' ? 'Your note has been placed ✨' : language === 'es' ? 'Tu nota fue depositada ✨' : 'Seu bilhete foi depositado ✨'
    );
  };

  const labels = {
    placeholder: language === 'en' ? 'Write your prayer or intention...' : language === 'es' ? 'Escribe tu oración o intención...' : 'Escreva sua oração ou intenção...',
    anonymous: language === 'en' ? 'Post anonymously' : language === 'es' ? 'Publicar anónimamente' : 'Publicar anonimamente',
    ecumenical: language === 'en' ? 'Share in Ecumenical Meeting' : language === 'es' ? 'Compartir en Encuentro Ecuménico' : 'Compartilhar no Encontro Ecumênico',
    submit: language === 'en' ? 'Place note' : language === 'es' ? 'Depositar nota' : 'Depositar bilhete',
  };

  return (
    <div className="space-y-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/40 dark:border-amber-800/30 rounded-lg p-4">
      <Textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={labels.placeholder}
        className="min-h-[100px] bg-background/80 font-serif resize-none"
        maxLength={500}
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
          <Label htmlFor="anonymous" className="text-xs flex items-center gap-1 cursor-pointer">
            {isAnonymous ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {labels.anonymous}
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
          <Label htmlFor="public" className="text-xs flex items-center gap-1 cursor-pointer">
            <Globe className="h-3 w-3" />
            {labels.ecumenical}
          </Label>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!content.trim() || loading}
        className="w-full gap-2"
      >
        <Send className="h-4 w-4" />
        {labels.submit}
      </Button>
    </div>
  );
}
