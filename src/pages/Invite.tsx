import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Gift, Share2, Users, Sparkles } from 'lucide-react';
import { t } from '@/lib/i18n';

export default function Invite() {
  const { user, language } = useApp();
  const { toast } = useToast();
  const [inviteLink, setInviteLink] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timesUsed, setTimesUsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadOrCreateInvite();
  }, [user]);

  const loadOrCreateInvite = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMsg(null);

    // Check if user already has an invite link
    const { data: existing, error: selectErr } = await supabase
      .from('invite_links')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (selectErr) {
      console.error('Error loading invite:', selectErr);
      setErrorMsg(selectErr.message);
      setLoading(false);
      return;
    }

    if (existing && existing.length > 0) {
      const inv = existing[0];
      setInviteCode(inv.code);
      setTimesUsed(inv.times_used);
      setInviteLink(`${window.location.origin}/invite/${inv.code}`);
      setLoading(false);
      return;
    }

    // Create a new invite link for this user
    const { data: newInvite, error } = await supabase
      .from('invite_links')
      .insert({
        created_by: user.id,
        questions_limit: 999,
        label: `Convite de ${user.email}`,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invite:', error);
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    if (newInvite) {
      setInviteCode(newInvite.code);
      setTimesUsed(0);
      setInviteLink(`${window.location.origin}/invite/${newInvite.code}`);
    }
    setLoading(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({ title: t('invite.copied', language) });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = inviteLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      toast({ title: t('invite.copied', language) });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('invite.share_title', language),
          text: t('invite.share_text', language),
          url: inviteLink,
        });
      } catch {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${t('invite.share_text', language)} ${inviteLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-sm w-full">
          <CardContent className="p-6 text-center space-y-3">
            <div className="text-4xl">🎁</div>
            <p className="text-sm text-muted-foreground">
              Faça login para gerar seu link de convite e presentear amigos com 7 dias grátis.
            </p>
            <Button asChild className="w-full">
              <a href="/auth?next=/invite-friends">Entrar</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 md:pb-4">
      <div className="container max-w-2xl py-8 px-4 space-y-6">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="text-5xl">🎁</div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            {t('invite.title', language)}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t('invite.subtitle', language)}
          </p>
        </div>

        {/* How it works */}
         <Card className="glass sacred-border">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {t('invite.how_it_works', language)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">1</div>
              <p className="text-sm text-muted-foreground">{t('invite.step1', language)}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">2</div>
              <p className="text-sm text-muted-foreground">{t('invite.step2', language)}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">3</div>
              <p className="text-sm text-muted-foreground">{t('invite.step3', language)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Invite Link */}
        <Card className="glass sacred-border sacred-glow">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              {t('invite.your_link', language)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="h-10 bg-muted animate-pulse rounded-md" />
            ) : errorMsg ? (
              <div className="space-y-3">
                <p className="text-sm text-destructive">
                  Não foi possível gerar seu link: {errorMsg}
                </p>
                <Button onClick={loadOrCreateInvite} variant="outline" size="sm">
                  Tentar novamente
                </Button>
              </div>
            ) : !inviteLink ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Link ainda não gerado.
                </p>
                <Button onClick={loadOrCreateInvite} size="sm">
                  Gerar meu link de convite
                </Button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input value={inviteLink} readOnly className="text-sm font-mono" />
                  <Button variant="outline" size="icon" onClick={copyToClipboard} className="shrink-0">
                    {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={shareLink} className="flex-1 gap-2 sacred-gradient text-primary-foreground border-0">
                    <Share2 className="h-4 w-4" />
                    {t('invite.share', language)}
                  </Button>
                  <Button onClick={shareWhatsApp} variant="secondary" className="flex-1 gap-2">
                    💬 WhatsApp
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="glass sacred-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{timesUsed}</p>
              <p className="text-sm text-muted-foreground">{t('invite.friends_joined', language)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
