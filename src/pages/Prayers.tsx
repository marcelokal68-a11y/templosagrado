import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Heart, Copy, Check, Mail, RefreshCw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const religions = ['christian', 'hindu', 'buddhist', 'islam', 'mormon', 'protestant', 'catholic', 'jewish', 'agnostic', 'spiritist', 'umbanda', 'candomble'];
const philosophies = ['stoicism', 'logosophy', 'humanism', 'epicureanism', 'transhumanism', 'pantheism', 'existentialism', 'objectivism', 'transcendentalism', 'altruism', 'rationalism', 'optimistic_nihilism', 'absurdism', 'utilitarianism', 'pragmatism'];

export default function Prayers() {
  const { language, user, chatContext } = useApp();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [intention, setIntention] = useState('');
  const [loading, setLoading] = useState(false);
  const [religion, setReligion] = useState(chatContext.religion || '');
  const [philosophy, setPhilosophy] = useState(chatContext.philosophy || '');
  const [copied, setCopied] = useState(false);
  const [generatedPrayer, setGeneratedPrayer] = useState('');
  const [recipientEmails, setRecipientEmails] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);

  const handleGenerate = async () => {
    if (!religion && !philosophy) {
      toast({ title: t('prayers.select_religion', language), variant: 'destructive' });
      return;
    }
    if (!intention.trim()) return;

    setLoading(true);
    setGeneratedPrayer('');
    try {
      const { data, error } = await supabase.functions.invoke('generate-prayer', {
        body: { intention, religion, philosophy, language, name },
      });

      if (error) throw error;
      if (data?.error) {
        if (data.error === 'Rate limit exceeded') {
          toast({ title: t('chat.rate_limit', language), description: t('chat.rate_limit_desc', language), variant: 'destructive' });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      const prayer = data?.prayer || '';
      setGeneratedPrayer(prayer);

      // Save to database
      await supabase.from('prayers').insert({
        user_id: user?.id || null,
        name: name || null,
        intention,
        religion: religion || philosophy || null,
        generated_text: prayer,
      } as any);

      toast({ title: t('prayers.success', language) });
    } catch (err: any) {
      toast({ title: t('chat.error', language), description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedPrayer || intention);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    const emails = recipientEmails.trim() || user?.email || '';
    if (!emails) {
      toast({ title: t('prayers.email_others', language), variant: 'destructive' });
      return;
    }
    const subject = encodeURIComponent(t('prayers.generated', language));
    const body = encodeURIComponent(generatedPrayer);
    window.open(`mailto:${emails}?subject=${subject}&body=${body}`);
  };

  const handleSendToMe = () => {
    if (!user?.email) {
      toast({ title: t('auth.login', language), variant: 'destructive' });
      return;
    }
    const subject = encodeURIComponent(t('prayers.generated', language));
    const body = encodeURIComponent(generatedPrayer);
    window.open(`mailto:${user.email}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 gap-6 overflow-y-auto">
      {/* Prayer Form */}
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Sparkles className="h-10 w-10 text-primary mx-auto mb-2" />
          <CardTitle className="font-display text-2xl">{t('prayers.title', language)}</CardTitle>
          <CardDescription>{t('prayers.subtitle', language)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Religion selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t('panel.religion', language)}</label>
              <div className="flex flex-wrap gap-2">
                {religions.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setReligion(r); setPhilosophy(''); }}
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

            {/* Philosophy selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t('panel.philosophy', language)}</label>
              <div className="flex flex-wrap gap-2">
                {philosophies.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setPhilosophy(p); setReligion(''); }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                      philosophy === p
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-secondary text-secondary-foreground border-border hover:bg-primary/10 hover:border-primary/30"
                    )}
                  >
                    {t(`philosophy.${p}`, language)}
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
            <Button
              onClick={handleGenerate}
              className="w-full"
              disabled={loading || !intention.trim() || (!religion && !philosophy)}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  {t('prayers.generating', language)}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t('prayers.generate', language)}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Prayer */}
      {generatedPrayer && (
        <Card className="w-full max-w-lg border-primary/20 bg-primary/5">
          <CardHeader className="text-center pb-3">
            <Heart className="h-8 w-8 text-primary mx-auto mb-1" />
            <CardTitle className="font-display text-xl">{t('prayers.generated', language)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 italic">
              {generatedPrayer}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-primary mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? t('posts.copied', language) : t('posts.copy', language)}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setGeneratedPrayer(''); handleGenerate(); }}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                {t('prayers.regenerate', language)}
              </Button>
              {user?.email && (
                <Button variant="outline" size="sm" onClick={handleSendToMe}>
                  <Mail className="h-4 w-4 mr-1" />
                  {t('prayers.email_to_me', language)}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowEmailInput(!showEmailInput)}>
                <Mail className="h-4 w-4 mr-1" />
                {t('prayers.email_others', language)}
              </Button>
            </div>

            {/* Email input */}
            {showEmailInput && (
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder={t('prayers.email_placeholder', language)}
                  value={recipientEmails}
                  onChange={e => setRecipientEmails(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleSendEmail} disabled={!recipientEmails.trim()}>
                  {t('prayers.send_email', language)}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
