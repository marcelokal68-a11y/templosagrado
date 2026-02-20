import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Heart, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const religions = ['christian', 'hindu', 'buddhist', 'islam', 'mormon', 'protestant', 'catholic', 'jewish', 'agnostic', 'spiritist', 'umbanda', 'candomble'];

export default function Prayers() {
  const { language, user, chatContext } = useApp();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [intention, setIntention] = useState('');
  const [loading, setLoading] = useState(false);
  const [religion, setReligion] = useState(chatContext.religion || '');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!religion) {
      toast({ title: t('prayers.select_religion', language), variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('prayers').insert({
        user_id: user?.id || null,
        name: name || null,
        intention,
        religion: religion || null,
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

  const handleCopy = async () => {
    const religionLabel = t(`religion.${religion}`, language);
    const text = `${name ? name + ' - ' : ''}${religionLabel}\n\n${intention}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            {/* Religion selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t('panel.religion', language)}</label>
              <div className="flex flex-wrap gap-2">
                {religions.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReligion(r)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                      religion === r
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-secondary text-secondary-foreground border-border hover:bg-primary/10 hover:border-primary/30"
                    )}
                  >
                    {t(`religion.${r}`, language)}
                  </button>
                ))}
              </div>
            </div>

            <Input placeholder={t('prayers.name', language)} value={name} onChange={e => setName(e.target.value)} />
            <Textarea
              placeholder={t('prayers.intention', language)}
              value={intention}
              onChange={e => setIntention(e.target.value)}
              required
              rows={4}
            />
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loading || !intention.trim() || !religion}>
                {loading ? '...' : t('prayers.send', language)}
              </Button>
              {intention.trim() && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  title={t('posts.copy', language)}
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
