import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Heart, Copy, Check, Mail, RefreshCw, Sparkles, User, ArrowLeft } from 'lucide-react';
import PublishToMural from '@/components/mural/PublishToMural';
import { cn } from '@/lib/utils';
import { FAB_SAFE_PADDING } from '@/components/fab/fabConfig';
import { useIsMobile } from '@/hooks/use-mobile';

const FAITH_OPTIONS = [
  { key: 'catholic', label: 'Católico', mode: 'religion' as const },
  { key: 'protestant', label: 'Evangélico', mode: 'religion' as const },
  { key: 'spiritist', label: 'Espírita', mode: 'religion' as const },
  { key: 'candomble', label: 'Matriz Africana', mode: 'religion' as const },
  { key: 'jewish', label: 'Judaísmo', mode: 'religion' as const },
  { key: 'hindu', label: 'Hinduísmo', mode: 'religion' as const },
  { key: 'mormon', label: 'Mórmon', mode: 'religion' as const },
  { key: 'agnostic', label: 'Agnóstico / Filosofia', mode: 'philosophy' as const },
];

type Mode = 'send' | 'practice' | null;

export default function Prayers() {
  const { language, user, chatContext } = useApp();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [mode, setMode] = useState<Mode>(null);
  const [name, setName] = useState('');
  const [intention, setIntention] = useState('');
  const [loading, setLoading] = useState(false);
  const [religion, setReligion] = useState(chatContext.religion || '');
  const [philosophy, setPhilosophy] = useState(chatContext.philosophy || '');
  const [copied, setCopied] = useState(false);
  const [generatedPrayer, setGeneratedPrayer] = useState('');
  const [recipientEmails, setRecipientEmails] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const isPhilosophy = !!philosophy && !religion;

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

      await supabase.from('prayers').insert({
        user_id: user?.id || null,
        name: name || null,
        intention,
        religion: religion || philosophy || null,
        generated_text: prayer,
      } as any);

      if (user && prayer) {
        (supabase.from('activity_history' as any) as any).insert({
          user_id: user.id,
          type: 'prayer',
          title: intention.length > 60 ? intention.slice(0, 60) + '...' : intention,
          content: prayer,
          metadata: { religion: religion || null, philosophy: philosophy || null, name: name || null },
        }).then(() => {});
      }

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

  const sendEmailViaResend = async (emails: string) => {
    setSendingEmail(true);
    try {
      const tradition = religion ? t(`religion.${religion}`, language) : philosophy ? t(`philosophy.${philosophy}`, language) : '';
      const { data, error } = await supabase.functions.invoke('send-prayer-email', {
        body: { to: emails, prayer: generatedPrayer, intention, tradition },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: t('prayers.email_sent', language) || 'Email enviado com sucesso!' });
      setRecipientEmails('');
    } catch (err: any) {
      toast({ title: t('chat.error', language), description: err.message, variant: 'destructive' });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSendToMe = () => {
    if (!user?.email) {
      toast({ title: t('auth.login', language), variant: 'destructive' });
      return;
    }
    sendEmailViaResend(user.email);
  };

  // Mode selector screen
  if (mode === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        <div className="text-center mb-2">
          <Sparkles className="h-10 w-10 text-primary mx-auto mb-2" />
          <h1 className="font-display text-2xl font-bold text-foreground">{t('prayers.title', language)}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('prayers.subtitle', language)}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
          <Card
            className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all group"
            onClick={() => setMode('send')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 gap-3 text-center">
              <div className="h-14 w-14 rounded-full sacred-gradient flex items-center justify-center sacred-glow">
                <Mail className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{t('prayers.mode_send', language)}</h3>
              <p className="text-xs text-muted-foreground">{t('prayers.mode_send_desc', language)}</p>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all group"
            onClick={() => setMode('practice')}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 gap-3 text-center">
              <div className="h-14 w-14 rounded-full sacred-gradient flex items-center justify-center sacred-glow">
                <User className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">{t('prayers.mode_practice', language)}</h3>
              <p className="text-xs text-muted-foreground">{t('prayers.mode_practice_desc', language)}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const outputTitle = isPhilosophy ? t('prayers.your_reflection', language) : t('prayers.your_prayer', language);
  const canGenerate = intention.trim() && (religion || philosophy);

  return (
    <div className={`flex-1 flex flex-col items-center justify-start p-4 gap-6 overflow-y-auto ${FAB_SAFE_PADDING}`}>
      {/* Prayer Form */}
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            size="sm"
            className="self-start -ml-2 -mt-2 mb-1"
            onClick={() => { setMode(null); setGeneratedPrayer(''); }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('prayers.back_to_modes', language)}
          </Button>
          <Sparkles className="h-10 w-10 text-primary mx-auto mb-2" />
          <CardTitle className="font-display text-2xl">{t('prayers.title', language)}</CardTitle>
          <CardDescription>{t('prayers.subtitle', language)}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Faith selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t('panel.religion', language)}</label>
              <div className="flex flex-wrap gap-2">
                {FAITH_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      if (opt.mode === 'religion') { setReligion(opt.key); setPhilosophy(''); }
                      else { setPhilosophy(opt.key); setReligion(''); }
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                      (religion === opt.key || philosophy === opt.key)
                        ? "sacred-gradient text-primary-foreground border-primary/50 shadow-sm sacred-glow"
                        : "bg-secondary text-secondary-foreground border-primary/10 hover:bg-primary/10 hover:border-primary/30"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name field */}
            {mode === 'send' ? (
              <Input placeholder={t('prayers.recipient_name', language)} value={name} onChange={e => setName(e.target.value)} />
            ) : (
              <Input placeholder={t('prayers.name', language)} value={name} onChange={e => setName(e.target.value)} />
            )}

            <Textarea
              placeholder={t('prayers.intention', language)}
              value={intention}
              onChange={e => setIntention(e.target.value)}
              required
              rows={3}
            />

            {/* Inline email for send mode */}
            {mode === 'send' && (
              <Input
                type="email"
                placeholder={t('prayers.recipient_email', language)}
                value={recipientEmails}
                onChange={e => setRecipientEmails(e.target.value)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Prayer */}
      {generatedPrayer && (
        <Card className="w-full max-w-lg glass sacred-border">
          <CardHeader className="text-center pb-3">
            {isPhilosophy ? <Sparkles className="h-8 w-8 text-primary mx-auto mb-1" /> : <Heart className="h-8 w-8 text-primary mx-auto mb-1" />}
            <CardTitle className="font-display text-xl">{outputTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 italic">
              {generatedPrayer}
            </div>

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
              <PublishToMural originalContent={generatedPrayer} variant="button" />
              {user?.email && (
                <Button variant="outline" size="sm" onClick={handleSendToMe}>
                  <Mail className="h-4 w-4 mr-1" />
                  {t('prayers.email_to_me', language)}
                </Button>
              )}
              {mode === 'send' && recipientEmails.trim() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => sendEmailViaResend(recipientEmails.trim())}
                  disabled={sendingEmail}
                >
                  {sendingEmail ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : <Mail className="h-4 w-4 mr-1" />}
                  {t('prayers.send_email', language)}
                </Button>
              )}
              {mode === 'practice' && (
                <Button variant="outline" size="sm" onClick={() => {
                  setRecipientEmails('');
                  const email = prompt(t('prayers.email_placeholder', language));
                  if (email) sendEmailViaResend(email);
                }}>
                  <Mail className="h-4 w-4 mr-1" />
                  {t('prayers.email_others', language)}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sticky generate button on mobile */}
      {!generatedPrayer && (
        <div className={cn(
          "w-full max-w-lg",
          isMobile && "fixed bottom-16 left-0 right-0 p-4 z-40 bg-gradient-to-t from-background via-background to-transparent"
        )}>
          <Button
            onClick={handleGenerate}
            className={cn(
              "w-full h-12 text-base sacred-gradient text-primary-foreground sacred-glow font-semibold",
              isMobile && "max-w-lg mx-auto"
            )}
            disabled={loading || !canGenerate}
          >
            {loading ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                {t('prayers.generating', language)}
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                {t('prayers.generate', language)}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
