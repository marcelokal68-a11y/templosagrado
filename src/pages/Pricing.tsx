import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star, Loader2, Settings, Crown, Infinity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PLANS = {
  monthly: {
    priceId: 'price_1T3dRaCkGJ1CW5bG9N43LMuq',
    productId: 'prod_U1gp611KZoR0wO',
  },
  annual: {
    priceId: 'price_1T3dZcCkGJ1CW5bGZvBy9ibE',
    productId: 'prod_U1gxCDHt1CMGuE',
  },
  topMonthly: {
    priceId: 'price_1T3ddNCkGJ1CW5bGQUj9TNmC',
    productId: 'prod_U1h1ABi9FUgLYT',
  },
  topAnnual: {
    priceId: 'price_1T3ddZCkGJ1CW5bGatX1GaLX',
    productId: 'prod_U1h1lIOr9aKvmO',
  },
};

const TOP_PRODUCT_IDS = [PLANS.topMonthly.productId, PLANS.topAnnual.productId];
const PREMIUM_PRODUCT_IDS = [PLANS.monthly.productId, PLANS.annual.productId];

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

  const handleSubscribe = async (planKey: keyof typeof PLANS) => {
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
  const isTopUser = subscription?.subscribed && TOP_PRODUCT_IDS.includes(subscription.product_id || '');
  const isPremiumUser = subscription?.subscribed && PREMIUM_PRODUCT_IDS.includes(subscription.product_id || '');

  const ManageButton = () => (
    <Button variant="outline" className="w-full" onClick={handleManage} disabled={loadingPortal}>
      {loadingPortal ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
      {t('pricing.manage', language)}
    </Button>
  );

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <h1 className="font-display text-3xl font-bold text-center mb-2">{t('pricing.title', language)}</h1>
        <p className="text-center text-muted-foreground text-sm mb-8">{t('pricing.cancel_note', language)}</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Free */}
          <Card className="relative">
            <CardHeader>
              <CardTitle className="font-display text-lg">{t('pricing.free', language)}</CardTitle>
              <CardDescription className="text-xs">{t('pricing.free_desc', language)}</CardDescription>
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
              <CardTitle className="font-display text-lg">{t('pricing.monthly', language)}</CardTitle>
              <CardDescription className="text-xs">{t('pricing.monthly_desc', language)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl font-bold font-display">R$19,90<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                {t('pricing.monthly_questions', language)}
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              {isCurrentPlan(PLANS.monthly.productId) ? <ManageButton /> : (
                <Button className="w-full" onClick={() => handleSubscribe('monthly')} disabled={!!loadingPlan || !!subscription?.subscribed}>
                  {loadingPlan === 'monthly' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {t('pricing.subscribe', language)}
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Annual */}
          <Card className={`relative ${isCurrentPlan(PLANS.annual.productId) ? 'border-primary shadow-lg' : ''}`}>
            <div className="absolute -top-3 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
              -17%
            </div>
            <CardHeader>
              <CardTitle className="font-display text-lg">Anual</CardTitle>
              <CardDescription className="text-xs">Economize com o plano anual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl font-bold font-display">R$199<span className="text-sm font-normal text-muted-foreground">/ano</span></p>
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                {t('pricing.monthly_questions', language)}
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              {isCurrentPlan(PLANS.annual.productId) ? <ManageButton /> : (
                <Button className="w-full" onClick={() => handleSubscribe('annual')} disabled={!!loadingPlan || !!subscription?.subscribed}>
                  {loadingPlan === 'annual' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {t('pricing.subscribe', language)}
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* TOP */}
          <Card className={`relative border-2 ${isTopUser ? 'border-yellow-500 shadow-xl' : 'border-yellow-500/50'}`}>
            <div className="absolute -top-3 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Crown className="h-3 w-3" /> TOP
            </div>
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2">
                {t('pricing.top', language)} <Infinity className="h-5 w-5 text-yellow-500" />
              </CardTitle>
              <CardDescription className="text-xs">{t('pricing.top_desc', language)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <p className="text-3xl font-bold font-display">R$39,90<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
                <p className="text-sm text-muted-foreground">ou R$399<span className="text-xs">/ano (-17%)</span></p>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Infinity className="h-4 w-4 text-yellow-500" />
                {t('pricing.top_questions', language)}
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              {isTopUser ? <ManageButton /> : (
                <div className="w-full space-y-2">
                  <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black" onClick={() => handleSubscribe('topMonthly')} disabled={!!loadingPlan || !!subscription?.subscribed}>
                    {loadingPlan === 'topMonthly' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {t('pricing.subscribe', language)} - Mensal
                  </Button>
                  <Button variant="outline" className="w-full border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10" onClick={() => handleSubscribe('topAnnual')} disabled={!!loadingPlan || !!subscription?.subscribed}>
                    {loadingPlan === 'topAnnual' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {t('pricing.subscribe', language)} - Anual
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground text-center">{t('pricing.pix_note', language)}</p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
