import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Heart } from 'lucide-react';

export default function Prayers() {
  const { language, user, chatContext } = useApp();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [intention, setIntention] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('prayers').insert({
        user_id: user?.id || null,
        name: name || null,
        intention,
        religion: chatContext.religion || null,
      });
      if (error) throw error;
      toast({ title: t('prayers.success', language) });
      setName('');
      setIntention('');
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Heart className="h-10 w-10 text-primary mx-auto mb-2" />
          <CardTitle className="font-display text-2xl">{t('prayers.title', language)}</CardTitle>
          <CardDescription>{t('prayers.subtitle', language)}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder={t('prayers.name', language)} value={name} onChange={e => setName(e.target.value)} />
            <Textarea
              placeholder={t('prayers.intention', language)}
              value={intention}
              onChange={e => setIntention(e.target.value)}
              required
              rows={4}
            />
            <Button type="submit" className="w-full" disabled={loading || !intention.trim()}>
              {loading ? '...' : t('prayers.send', language)}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
