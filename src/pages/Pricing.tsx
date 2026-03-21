import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Settings, Sparkles, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

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

const FREE_FEATURES = [
  '10 mensagens por dia',
  'Chat com mentor espiritual',
  'Versículo do dia básico',
];

const FREE_LIMITATIONS = [
  'Sem publicar no mural',
  'Sem áudio das respostas',
  'Sem memória personalizada',
];

const PRO_FEATURES = [
  '60 mensagens por dia',
  'Versículo do Dia exclusivo com áudio',
  'Publicar no Mural Sagrado',
  'Áudio em todas as respostas',
  'Memória personalizada (o mentor lembra de você)',
  'Histórico completo',
];

const TOP_EXTRAS = [
  'Mensagens ilimitadas',
  'Acesso antecipado a novidades',
  'Suporte prioritário',
];

export default function Pricing() {
  const { language, user } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<{ subscribed: boolean; product_id?: string; subscription_end?: string } | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast({ title: 'Assinatura realizada com sucesso! 🎉' });
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

  const isTopUser = subscription?.subscribed && TOP_PRODUCT_IDS.includes(subscription.product_id || '');
  const isPremiumUser = subscription?.subscribed && PREMIUM_PRODUCT_IDS.includes(subscription.product_id || '');
  const isSubscribed = subscription?.subscribed;

  return (
    <div className="flex-1 overflow-y-auto pb-20 md:pb-8">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 ring-1 ring-primary/20">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">
            Escolha seu plano
          </h1>
          <p className="text-sm text-muted-foreground">
            Cancele quando quiser. Sem compromisso.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              billingCycle === 'monthly'
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            Mensal
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors relative",
              billingCycle === 'annual'
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            Anual
            <span className="absolute -top-2 -right-2 bg-green-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
              -17%
            </span>
          </button>
        </div>

        {/* Plans — stacked on mobile */}
        <div className="space-y-4">
          {/* Free Plan */}
          <div className={cn(
            "rounded-2xl border p-5 transition-all",
            !isSubscribed ? "border-primary/30 bg-primary/5" : "border-border/50 bg-card"
          )}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">Gratuito</h3>
                <p className="text-xs text-muted-foreground">Para experimentar o Templo</p>
              </div>
              <span className="text-2xl font-bold font-display text-foreground">R$0</span>
            </div>
            <div className="space-y-2 mb-4">
              {FREE_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
              {FREE_LIMITATIONS.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground/60">
                  <X className="h-3.5 w-3.5 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            {!isSubscribed && (
              <Button variant="outline" className="w-full" disabled>
                Plano atual
              </Button>
            )}
          </div>

          {/* Pro Plan */}
          <div className={cn(
            "rounded-2xl border-2 p-5 transition-all relative",
            isPremiumUser ? "border-primary bg-primary/5 shadow-lg" : "border-primary/50 bg-card"
          )}>
            {!isSubscribed && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                ⭐ Mais popular
              </div>
            )}
            <div className="flex items-center justify-between mb-3 mt-1">
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">Pro</h3>
                <p className="text-xs text-muted-foreground">Para sua jornada diária</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-display text-foreground">
                  {billingCycle === 'monthly' ? 'R$19,90' : 'R$199'}
                </span>
                <span className="text-xs text-muted-foreground block">
                  /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                </span>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {PRO_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            {isPremiumUser ? (
              <Button variant="outline" className="w-full" onClick={handleManage} disabled={loadingPortal}>
                {loadingPortal ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
                Gerenciar assinatura
              </Button>
            ) : (
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
                onClick={() => handleSubscribe(billingCycle === 'monthly' ? 'monthly' : 'annual')}
                disabled={!!loadingPlan || isTopUser}
              >
                {(loadingPlan === 'monthly' || loadingPlan === 'annual') && <Loader2 className="h-4 w-4 animate-spin" />}
                <Sparkles className="h-4 w-4" />
                Assinar Pro
              </Button>
            )}
          </div>

          {/* TOP Plan */}
          <div className={cn(
            "rounded-2xl border-2 p-5 transition-all relative",
            isTopUser ? "border-amber-500 bg-amber-500/5 shadow-lg" : "border-amber-500/30 bg-card"
          )}>
            <div className="absolute -top-3 right-4 bg-amber-500 text-black px-3 py-1 rounded-full text-xs font-bold">
              TOP
            </div>
            <div className="flex items-center justify-between mb-3 mt-1">
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">Ilimitado</h3>
                <p className="text-xs text-muted-foreground">Para devotos dedicados</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-display text-foreground">
                  {billingCycle === 'monthly' ? 'R$39,90' : 'R$399'}
                </span>
                <span className="text-xs text-muted-foreground block">
                  /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                </span>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {PRO_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
              {TOP_EXTRAS.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm font-medium text-amber-700">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            {isTopUser ? (
              <Button variant="outline" className="w-full border-amber-500/30" onClick={handleManage} disabled={loadingPortal}>
                {loadingPortal ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
                Gerenciar assinatura
              </Button>
            ) : (
              <Button
                className="w-full bg-amber-500 text-black hover:bg-amber-600 gap-1.5"
                onClick={() => handleSubscribe(billingCycle === 'monthly' ? 'topMonthly' : 'topAnnual')}
                disabled={!!loadingPlan || !!isSubscribed}
              >
                {(loadingPlan === 'topMonthly' || loadingPlan === 'topAnnual') && <Loader2 className="h-4 w-4 animate-spin" />}
                Assinar Ilimitado
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          Pagamento seguro via Stripe. PIX disponível no checkout.
        </p>
      </div>
    </div>
  );
}
