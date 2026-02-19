import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star, Loader2, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PLANS = {
  monthly: {
    priceId: 'price_1T2fE3CkGJ1CW5bGNUoxI1uo',
    productId: 'prod_U0gbjXw27dj6Hd',
  },
  annual: {
    priceId: 'price_1T2fEnCkGJ1CW5bGv9fgUSq3',
    productId: 'prod_U0gckVzX4EtzIG',
  },
};

export default function Pricing() {
  const { language, user } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<{ subscribed: boolean; product_id?: string; subscription_end?: string } | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast({ title: t('pricing.success', language) || 'Assinatura realizada com sucesso!' });
      checkSub();
    }
  }, [searchParams]);

  const checkSub = async () => {
    if (!user) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await supabase.functions.invoke('check-subscription', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (resp.data) setSubscription(resp.data);
    } catch {}
  };

  useEffect(() => { checkSub(); }, [user]);

  const handleSubscribe = async (planKey: 'monthly' | 'annual') => {
    if (!user) { navigate('/auth'); return; }
    setLoadingPlan(planKey);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await supabase.functions.invoke('create-checkout', {
        body: { priceId: PLANS[planKey].priceId },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (resp.data?.url) {
        window.open(resp.data.url, '_blank');
      } else {
        throw new Error(resp.data?.error || 'Erro ao criar sessão');
      }
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManage = async () => {
    setLoadingPortal(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await supabase.functions.invoke('customer-portal', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (resp.data?.url) window.open(resp.data.url, '_blank');
    } catch {} finally { setLoadingPortal(false); }
  };

  const isCurrentPlan = (productId: string) => subscription?.subscribed && subscription.product_id === productId;

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <h1 className="font-display text-3xl font-bold text-center mb-8">{t('pricing.title', language)}</h1>
        <div className="grid md:grid-cols-3 gap-6">
          {/* Free */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="font-display text-xl">{t('pricing.free', language)}</CardTitle>
              <CardDescription>{t('pricing.free_desc', language)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl font-bold font-display">R$0</p>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                {t('pricing.free_questions', language)}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled>
                {!subscription?.subscribed ? t('pricing.current', language) : t('pricing.free', language)}
              </Button>
            </CardFooter>
          </Card>

          {/* Monthly */}
          <Card className={`relative ${isCurrentPlan(PLANS.monthly.productId) ? 'border-primary shadow-lg' : ''}`}>
            {!subscription?.subscribed && (
              <div className="absolute -top-3 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Star className="h-3 w-3" /> Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="font-display text-xl">{t('pricing.monthly', language)}</CardTitle>
              <CardDescription>{t('pricing.monthly_desc', language)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl font-bold font-display">R$10<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                {t('pricing.monthly_questions', language)}
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              {isCurrentPlan(PLANS.monthly.productId) ? (
                <Button variant="outline" className="w-full" onClick={handleManage} disabled={loadingPortal}>
                  {loadingPortal ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
                  Gerenciar assinatura
                </Button>
              ) : (
                <Button className="w-full" onClick={() => handleSubscribe('monthly')} disabled={!!loadingPlan || subscription?.subscribed}>
                  {loadingPlan === 'monthly' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {t('pricing.subscribe', language)}
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Annual */}
          <Card className={`relative ${isCurrentPlan(PLANS.annual.productId) ? 'border-primary shadow-lg' : ''}`}>
            <div className="absolute -top-3 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
              -17%
            </div>
            <CardHeader>
              <CardTitle className="font-display text-xl">Anual</CardTitle>
              <CardDescription>Economize com o plano anual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl font-bold font-display">R$100<span className="text-sm font-normal text-muted-foreground">/ano</span></p>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                {t('pricing.monthly_questions', language)}
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              {isCurrentPlan(PLANS.annual.productId) ? (
                <Button variant="outline" className="w-full" onClick={handleManage} disabled={loadingPortal}>
                  {loadingPortal ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
                  Gerenciar assinatura
                </Button>
              ) : (
                <Button className="w-full" onClick={() => handleSubscribe('annual')} disabled={!!loadingPlan || subscription?.subscribed}>
                  {loadingPlan === 'annual' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {t('pricing.subscribe', language)}
                </Button>
              )}
              <p className="text-xs text-muted-foreground text-center">{t('pricing.pix_note', language)}</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
