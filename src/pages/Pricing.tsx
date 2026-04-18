import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Settings, Sparkles, X, Ban } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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
  '20 mensagens no mês',
  'Chat com mentor espiritual',
  'Versículo do dia básico',
];

const FREE_LIMITATIONS = [
  'Sem publicar no mural',
  'Sem áudio das respostas',
  'Sem memória personalizada',
];

const PRO_FEATURES = [
  'Mensagens ilimitadas',
  'Versículo do Dia exclusivo com áudio',
  'Publicar no Mural Sagrado',
  'Áudio em todas as respostas',
  'Memória personalizada (o mentor lembra de você)',
  'Histórico completo',
];

const TOP_EXTRAS = [
  'Acesso antecipado a novidades',
  'Suporte prioritário',
];

export default function Pricing() {
  const { language, user, refreshProfile } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<{ subscribed: boolean; product_id?: string; subscription_end?: string } | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [pendingChange, setPendingChange] = useState<{
    planKey: keyof typeof PLANS;
    type: 'upgrade' | 'downgrade';
    label: string;
    price: string;
  } | null>(null);
  const [loadingChange, setLoadingChange] = useState(false);

  // Price amount map (in cents) for upgrade/downgrade detection
  const PRICE_AMOUNTS: Record<string, number> = {
    [PLANS.monthly.priceId]: 1990,
    [PLANS.annual.priceId]: 19900,
    [PLANS.topMonthly.priceId]: 3990,
    [PLANS.topAnnual.priceId]: 39900,
  };

  const PLAN_LABELS: Record<keyof typeof PLANS, string> = {
    monthly: 'Devoto Mensal (R$ 19,90/mês)',
    annual: 'Devoto Anual (R$ 199/ano)',
    topMonthly: 'Iluminado Mensal (R$ 39,90/mês)',
    topAnnual: 'Iluminado Anual (R$ 399/ano)',
  };

  const getCurrentPriceId = (): string | null => {
    if (!subscription?.product_id) return null;
    if (subscription.product_id === PLANS.monthly.productId) return PLANS.monthly.priceId;
    if (subscription.product_id === PLANS.annual.productId) return PLANS.annual.priceId;
    if (subscription.product_id === PLANS.topMonthly.productId) return PLANS.topMonthly.priceId;
    if (subscription.product_id === PLANS.topAnnual.productId) return PLANS.topAnnual.priceId;
    return null;
  };

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast({ title: 'Assinatura realizada com sucesso! 🎉' });
      (async () => {
        await checkSub();
        await refreshProfile();
        // Redirect to chat after confirming subscription
        setTimeout(() => navigate('/', { replace: true }), 1500);
      })();
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

  const handleClickPlan = (planKey: keyof typeof PLANS) => {
    if (!user) { navigate('/auth'); return; }

    // If not subscribed → new checkout
    if (!subscription?.subscribed) {
      handleSubscribe(planKey);
      return;
    }

    // Already subscribed → detect upgrade/downgrade
    const currentPriceId = getCurrentPriceId();
    const newPriceId = PLANS[planKey].priceId;
    if (currentPriceId === newPriceId) return; // same plan

    const currentAmount = currentPriceId ? PRICE_AMOUNTS[currentPriceId] ?? 0 : 0;
    const newAmount = PRICE_AMOUNTS[newPriceId] ?? 0;
    const type: 'upgrade' | 'downgrade' = newAmount > currentAmount ? 'upgrade' : 'downgrade';

    setPendingChange({
      planKey,
      type,
      label: PLAN_LABELS[planKey],
      price: PLAN_LABELS[planKey],
    });
  };

  const confirmChangePlan = async () => {
    if (!pendingChange) return;
    setLoadingChange(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await supabase.functions.invoke('change-subscription', {
        body: { newPriceId: PLANS[pendingChange.planKey].priceId },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (resp.error) throw new Error(resp.error.message || 'Erro ao trocar plano');
      if (resp.data?.error) throw new Error(resp.data.error);

      toast({
        title: pendingChange.type === 'upgrade' ? 'Upgrade realizado! 🎉' : 'Downgrade agendado',
        description: resp.data?.message || 'Plano alterado com sucesso.',
      });
      await checkSub();
      await refreshProfile();
      setPendingChange(null);
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setLoadingChange(false);
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

  const handleCancel = async () => {
    setLoadingCancel(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await supabase.functions.invoke('cancel-subscription', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (resp.data?.success) {
        const endDate = resp.data.cancel_at
          ? new Date(resp.data.cancel_at).toLocaleDateString('pt-BR')
          : 'o fim do período';
        toast({
          title: 'Assinatura cancelada',
          description: `Você manterá acesso até ${endDate}.`,
        });
        await checkSub();
        await refreshProfile();
      } else {
        throw new Error(resp.data?.error || 'Erro ao cancelar');
      }
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setLoadingCancel(false);
    }
  };

  const CancelButton = () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 mt-2" disabled={loadingCancel}>
          {loadingCancel ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Ban className="h-4 w-4 mr-2" />}
          Cancelar assinatura
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancelar assinatura?</AlertDialogTitle>
          <AlertDialogDescription>
            Você manterá acesso completo até o fim do período já pago. Após essa data, sua conta voltará ao plano Gratuito. Você pode reassinar quando quiser.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Manter assinatura</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Sim, cancelar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const isTopUser = subscription?.subscribed && TOP_PRODUCT_IDS.includes(subscription.product_id || '');
  const isPremiumUser = subscription?.subscribed && PREMIUM_PRODUCT_IDS.includes(subscription.product_id || '');
  const isSubscribed = subscription?.subscribed;

  const isOnboarding = searchParams.get('onboarding') === '1';

  const handleContinueTrial = () => {
    let intent = '/';
    try {
      intent = sessionStorage.getItem('post_signup_intent') || '/';
      sessionStorage.removeItem('post_signup_intent');
    } catch {}
    navigate(intent, { replace: true });
  };

  return (
    <div className="flex-1 overflow-y-auto pb-20 md:pb-8">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Onboarding welcome banner */}
        {isOnboarding && user && (
          <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-center">
            <p className="text-sm text-foreground/90 leading-relaxed">
              ✨ <strong>Bem-vindo ao Templo Sagrado!</strong> Para acessar essa funcionalidade, escolha um plano abaixo ou continue com seus <strong>7 dias grátis</strong>.
            </p>
            <Button
              onClick={handleContinueTrial}
              variant="outline"
              className="mt-3 w-full border-primary/40 text-primary hover:bg-primary/10"
            >
              Continuar com 7 dias grátis
            </Button>
          </div>
        )}

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
                ⭐ Mais escolhido
              </div>
            )}
            <div className="flex items-center justify-between mb-3 mt-1">
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">Devoto</h3>
                <p className="text-xs text-muted-foreground">Sua jornada espiritual diária</p>
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
            {isPremiumUser && getCurrentPriceId() === PLANS[billingCycle === 'monthly' ? 'monthly' : 'annual'].priceId ? (
              <>
                <Button variant="outline" className="w-full" onClick={handleManage} disabled={loadingPortal}>
                  {loadingPortal ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
                  Gerenciar assinatura
                </Button>
                <CancelButton />
              </>
            ) : (
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
                onClick={() => handleClickPlan(billingCycle === 'monthly' ? 'monthly' : 'annual')}
                disabled={!!loadingPlan}
              >
                {(loadingPlan === 'monthly' || loadingPlan === 'annual') && <Loader2 className="h-4 w-4 animate-spin" />}
                <Sparkles className="h-4 w-4" />
                {isSubscribed ? 'Mudar para Devoto' : 'Assinar Devoto'}
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
                <h3 className="font-display text-lg font-semibold text-foreground">Iluminado</h3>
                <p className="text-xs text-muted-foreground">Para quem busca o máximo</p>
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
            {isTopUser && getCurrentPriceId() === PLANS[billingCycle === 'monthly' ? 'topMonthly' : 'topAnnual'].priceId ? (
              <>
                <Button variant="outline" className="w-full border-amber-500/30" onClick={handleManage} disabled={loadingPortal}>
                  {loadingPortal ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
                  Gerenciar assinatura
                </Button>
                <CancelButton />
              </>
            ) : (
              <Button
                className="w-full bg-amber-500 text-black hover:bg-amber-600 gap-1.5"
                onClick={() => handleClickPlan(billingCycle === 'monthly' ? 'topMonthly' : 'topAnnual')}
                disabled={!!loadingPlan}
              >
                {(loadingPlan === 'topMonthly' || loadingPlan === 'topAnnual') && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubscribed ? 'Mudar para Iluminado' : 'Assinar Iluminado'}
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          Pagamento seguro via Stripe. PIX disponível no checkout.
        </p>
      </div>

      {/* Change plan confirmation dialog */}
      <AlertDialog open={!!pendingChange} onOpenChange={(open) => !open && setPendingChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingChange?.type === 'upgrade' ? 'Confirmar upgrade de plano?' : 'Confirmar downgrade de plano?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 pt-2">
              {pendingChange?.type === 'upgrade' ? (
                <>
                  <span className="block">
                    Você está fazendo upgrade para <strong>{pendingChange?.label}</strong>.
                  </span>
                  <span className="block">
                    Cobraremos <strong>hoje</strong> apenas a <strong>diferença proporcional</strong> dos dias restantes do seu ciclo atual no seu cartão cadastrado.
                  </span>
                  <span className="block">
                    A partir da próxima renovação, será cobrado o valor cheio do novo plano.
                  </span>
                  <span className="block text-foreground/80">
                    Seu acesso ao plano superior é liberado <strong>imediatamente</strong>.
                  </span>
                </>
              ) : (
                <>
                  <span className="block">
                    Sua assinatura <strong>atual já paga</strong> continuará vigente até o <strong>fim do período contratado</strong>
                    {subscription?.subscription_end && (
                      <> (<strong>{new Date(subscription.subscription_end).toLocaleDateString('pt-BR')}</strong>)</>
                    )}.
                  </span>
                  <span className="block text-destructive font-medium">
                    Não há reembolso ou cashback pelo período não utilizado.
                  </span>
                  <span className="block">
                    Após essa data, sua conta passará automaticamente para <strong>{pendingChange?.label}</strong>.
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingChange}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); confirmChangePlan(); }}
              disabled={loadingChange}
            >
              {loadingChange && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {pendingChange?.type === 'upgrade' ? 'Confirmar upgrade' : 'Confirmar downgrade'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
