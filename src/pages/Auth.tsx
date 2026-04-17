import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { lovable } from '@/integrations/lovable/index';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import temploLogo from '@/assets/templo-logo.png';

export default function Auth() {
  const { language, user } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const [justSignedUp, setJustSignedUp] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(justSignedUp ? '/profile?onboarding=true' : '/', { replace: true });
    }
  }, [user, navigate, justSignedUp]);

  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else {
        if (!lgpdAccepted) {
          toast({ title: 'LGPD', description: t('lgpd.signup_checkbox', language), variant: 'destructive' });
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setJustSignedUp(true);
        // If session is created immediately, useEffect will redirect to /profile?onboarding=true
        if (data.session) {
          navigate('/profile?onboarding=true', { replace: true });
        } else {
          // Email confirmation required: try auto-login (some configs allow it)
          const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
          if (signInErr) {
            toast({ title: 'Conta criada!', description: 'Verifique seu email para confirmar antes de entrar.' });
          }
        }
      }
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src={temploLogo} alt="Templo Sagrado" className="h-14 mx-auto mb-2" />
          <CardTitle className="sr-only">{t('chat.title', language)}</CardTitle>
          <CardDescription>{t('auth.subtitle', language)}</CardDescription>
          <p className="text-xs text-muted-foreground mt-1">
            {isLogin ? t('auth.login', language) : t('auth.signup', language)}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGoogleLogin} variant="outline" className="w-full flex items-center gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Entrar com Google
          </Button>

          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">ou</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input placeholder={t('auth.name', language)} value={name} onChange={e => setName(e.target.value)} />
            )}
            <Input type="email" placeholder={t('auth.email', language)} value={email} onChange={e => setEmail(e.target.value)} required />
            <Input type="password" placeholder={t('auth.password', language)} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            {!isLogin && (
              <div className="flex items-start gap-2">
                <Checkbox
                  id="lgpd-signup"
                  checked={lgpdAccepted}
                  onCheckedChange={(checked) => setLgpdAccepted(checked === true)}
                />
                <label htmlFor="lgpd-signup" className="text-xs text-muted-foreground leading-snug cursor-pointer">
                  {t('lgpd.signup_checkbox', language)}{' '}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
                    {language === 'en' ? 'Privacy Policy' : language === 'es' ? 'Política de Privacidad' : 'Política de Privacidade'}
                  </a>
                </label>
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading || (!isLogin && !lgpdAccepted)}>
              {loading ? '...' : isLogin ? t('auth.login', language) : t('auth.signup', language)}
            </Button>
          </form>
          <div className="text-center text-sm text-muted-foreground">
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">
              {isLogin ? t('auth.no_account', language) : t('auth.has_account', language)}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
