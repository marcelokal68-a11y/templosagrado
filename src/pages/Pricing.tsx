import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
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

const LABELS = {
  'pt-BR': {
    success: 'Assinatura realizada com sucesso! 🎉',
    sessionError: 'Erro ao criar sessão',
    error: 'Erro',
    upgradeOk: 'Upgrade realizado! 🎉',
    downgradeOk: 'Downgrade agendado',
    planChanged: 'Plano alterado com sucesso.',
    planChangeError: 'Erro ao trocar plano',
    cancelled: 'Assinatura cancelada',
    cancelKeepUntil: (d: string) => `Você manterá acesso até ${d}.`,
    cancelEnd: 'o fim do período',
    cancelError: 'Erro ao cancelar',
    cancelBtn: 'Cancelar assinatura',
    cancelTitle: 'Cancelar assinatura?',
    cancelDesc: 'Você manterá acesso completo até o fim do período já pago. Após essa data, sua conta voltará ao plano Gratuito. Você pode reassinar quando quiser.',
    keepSub: 'Manter assinatura',
    yesCancel: 'Sim, cancelar',
    welcomeOnboarding: 'Bem-vindo ao Templo Sagrado!',
    welcomeBody: 'Você tem 20 mensagens grátis por mês no chat. Para acesso completo e mensagens ilimitadas, escolha um plano abaixo.',
    continueFree: 'Continuar no plano gratuito',
    chooseTitle: 'Escolha seu plano',
    chooseSub: 'Cancele quando quiser. Sem compromisso.',
    monthly: 'Mensal',
    annual: 'Anual',
    free: 'Gratuito',
    freeDesc: 'Para experimentar o Templo',
    currentPlan: 'Plano atual',
    devoto: 'Devoto',
    devotoDesc: 'Sua jornada espiritual diária',
    iluminado: 'Iluminado',
    iluminadoDesc: 'Para quem busca o máximo',
    perMonth: 'mês',
    perYear: 'ano',
    mostPopular: '⭐ Mais escolhido',
    manage: 'Gerenciar assinatura',
    subscribeDevoto: 'Assinar Devoto',
    changeDevoto: 'Mudar para Devoto',
    subscribeIluminado: 'Assinar Iluminado',
    changeIluminado: 'Mudar para Iluminado',
    payFooter: 'Pagamento seguro via Stripe. PIX disponível no checkout.',
    confirmUpgrade: 'Confirmar upgrade de plano?',
    confirmDowngrade: 'Confirmar downgrade de plano?',
    upgradingTo: 'Você está fazendo upgrade para',
    upgradeProrate: 'Cobraremos hoje apenas a diferença proporcional dos dias restantes do seu ciclo atual no seu cartão cadastrado.',
    upgradeNext: 'A partir da próxima renovação, será cobrado o valor cheio do novo plano.',
    upgradeImmediate: 'Seu acesso ao plano superior é liberado imediatamente.',
    downgradeKeep: 'Sua assinatura atual já paga continuará vigente até o fim do período contratado',
    downgradeNoRefund: 'Não há reembolso ou cashback pelo período não utilizado.',
    downgradeAfter: 'Após essa data, sua conta passará automaticamente para',
    cancelChange: 'Cancelar',
    confirmUpgradeBtn: 'Confirmar upgrade',
    confirmDowngradeBtn: 'Confirmar downgrade',
    free_features: ['20 mensagens no mês', 'Chat com mentor espiritual', 'Versículo do dia básico'],
    free_limits: ['Sem publicar no mural', 'Sem áudio das respostas', 'Sem memória personalizada'],
    pro_features: ['Mensagens ilimitadas', 'Versículo do Dia exclusivo com áudio', 'Publicar no Mural Sagrado', 'Áudio em todas as respostas', 'Memória personalizada (o mentor lembra de você)', 'Histórico completo'],
    top_extras: ['Acesso antecipado a novidades', 'Suporte prioritário'],
    locale: 'pt-BR',
  },
  en: {
    success: 'Subscription successful! 🎉',
    sessionError: 'Failed to create session',
    error: 'Error',
    upgradeOk: 'Upgrade complete! 🎉',
    downgradeOk: 'Downgrade scheduled',
    planChanged: 'Plan changed successfully.',
    planChangeError: 'Failed to change plan',
    cancelled: 'Subscription cancelled',
    cancelKeepUntil: (d: string) => `You will keep access until ${d}.`,
    cancelEnd: 'the end of the period',
    cancelError: 'Failed to cancel',
    cancelBtn: 'Cancel subscription',
    cancelTitle: 'Cancel subscription?',
    cancelDesc: 'You will keep full access until the end of the period already paid. After that date, your account will revert to the Free plan. You can resubscribe anytime.',
    keepSub: 'Keep subscription',
    yesCancel: 'Yes, cancel',
    welcomeOnboarding: 'Welcome to Sacred Temple!',
    welcomeBody: 'You have 20 free chat messages per month. For full access and unlimited messages, choose a plan below.',
    continueFree: 'Continue on free plan',
    chooseTitle: 'Choose your plan',
    chooseSub: 'Cancel anytime. No commitment.',
    monthly: 'Monthly',
    annual: 'Annual',
    free: 'Free',
    freeDesc: 'To try the Temple',
    currentPlan: 'Current plan',
    devoto: 'Devotee',
    devotoDesc: 'Your daily spiritual journey',
    iluminado: 'Illuminated',
    iluminadoDesc: 'For those seeking the most',
    perMonth: 'mo',
    perYear: 'yr',
    mostPopular: '⭐ Most chosen',
    manage: 'Manage subscription',
    subscribeDevoto: 'Subscribe Devotee',
    changeDevoto: 'Switch to Devotee',
    subscribeIluminado: 'Subscribe Illuminated',
    changeIluminado: 'Switch to Illuminated',
    payFooter: 'Secure payment via Stripe.',
    confirmUpgrade: 'Confirm plan upgrade?',
    confirmDowngrade: 'Confirm plan downgrade?',
    upgradingTo: 'You are upgrading to',
    upgradeProrate: 'We will charge today only the prorated difference for the remaining days of your current cycle on your registered card.',
    upgradeNext: 'From the next renewal onwards, the full price of the new plan will be charged.',
    upgradeImmediate: 'Your access to the higher plan is unlocked immediately.',
    downgradeKeep: 'Your currently paid subscription will remain active until the end of the contracted period',
    downgradeNoRefund: 'There is no refund or cashback for the unused period.',
    downgradeAfter: 'After that date, your account will automatically switch to',
    cancelChange: 'Cancel',
    confirmUpgradeBtn: 'Confirm upgrade',
    confirmDowngradeBtn: 'Confirm downgrade',
    free_features: ['20 messages per month', 'Chat with spiritual mentor', 'Basic daily verse'],
    free_limits: ['No publishing on the wall', 'No response audio', 'No personalized memory'],
    pro_features: ['Unlimited messages', 'Exclusive Daily Verse with audio', 'Publish on the Sacred Wall', 'Audio on every response', 'Personalized memory (mentor remembers you)', 'Full history'],
    top_extras: ['Early access to news', 'Priority support'],
    locale: 'en-US',
  },
  es: {
    success: '¡Suscripción exitosa! 🎉',
    sessionError: 'Error al crear sesión',
    error: 'Error',
    upgradeOk: '¡Upgrade realizado! 🎉',
    downgradeOk: 'Downgrade programado',
    planChanged: 'Plan cambiado con éxito.',
    planChangeError: 'Error al cambiar de plan',
    cancelled: 'Suscripción cancelada',
    cancelKeepUntil: (d: string) => `Conservarás el acceso hasta ${d}.`,
    cancelEnd: 'el fin del período',
    cancelError: 'Error al cancelar',
    cancelBtn: 'Cancelar suscripción',
    cancelTitle: '¿Cancelar suscripción?',
    cancelDesc: 'Conservarás acceso completo hasta el fin del período ya pagado. Después de esa fecha, tu cuenta volverá al plan Gratis. Puedes resuscribirte cuando quieras.',
    keepSub: 'Mantener suscripción',
    yesCancel: 'Sí, cancelar',
    welcomeOnboarding: '¡Bienvenido a Templo Sagrado!',
    welcomeBody: 'Tienes 20 mensajes gratis por mes en el chat. Para acceso completo y mensajes ilimitados, elige un plan abajo.',
    continueFree: 'Continuar en el plan gratis',
    chooseTitle: 'Elige tu plan',
    chooseSub: 'Cancela cuando quieras. Sin compromiso.',
    monthly: 'Mensual',
    annual: 'Anual',
    free: 'Gratis',
    freeDesc: 'Para probar el Templo',
    currentPlan: 'Plan actual',
    devoto: 'Devoto',
    devotoDesc: 'Tu jornada espiritual diaria',
    iluminado: 'Iluminado',
    iluminadoDesc: 'Para quien busca lo máximo',
    perMonth: 'mes',
    perYear: 'año',
    mostPopular: '⭐ Más elegido',
    manage: 'Gestionar suscripción',
    subscribeDevoto: 'Suscribir Devoto',
    changeDevoto: 'Cambiar a Devoto',
    subscribeIluminado: 'Suscribir Iluminado',
    changeIluminado: 'Cambiar a Iluminado',
    payFooter: 'Pago seguro vía Stripe.',
    confirmUpgrade: '¿Confirmar upgrade de plan?',
    confirmDowngrade: '¿Confirmar downgrade de plan?',
    upgradingTo: 'Estás haciendo upgrade a',
    upgradeProrate: 'Cobraremos hoy solo la diferencia proporcional de los días restantes de tu ciclo actual en tu tarjeta registrada.',
    upgradeNext: 'A partir de la próxima renovación, se cobrará el valor completo del nuevo plan.',
    upgradeImmediate: 'Tu acceso al plan superior se libera inmediatamente.',
    downgradeKeep: 'Tu suscripción actual ya pagada seguirá vigente hasta el fin del período contratado',
    downgradeNoRefund: 'No hay reembolso ni cashback por el período no usado.',
    downgradeAfter: 'Después de esa fecha, tu cuenta pasará automáticamente a',
    cancelChange: 'Cancelar',
    confirmUpgradeBtn: 'Confirmar upgrade',
    confirmDowngradeBtn: 'Confirmar downgrade',
    free_features: ['20 mensajes al mes', 'Chat con mentor espiritual', 'Versículo del día básico'],
    free_limits: ['Sin publicar en el muro', 'Sin audio de respuestas', 'Sin memoria personalizada'],
    pro_features: ['Mensajes ilimitados', 'Versículo del Día exclusivo con audio', 'Publicar en el Muro Sagrado', 'Audio en todas las respuestas', 'Memoria personalizada (el mentor te recuerda)', 'Historial completo'],
    top_extras: ['Acceso anticipado a novedades', 'Soporte prioritario'],
    locale: 'es-ES',
  },
};

export default function Pricing() {
  const { language, user, refreshProfile } = useApp();
  const L = LABELS[language] || LABELS['pt-BR'];
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

  const PRICE_AMOUNTS: Record<string, number> = {
    [PLANS.monthly.priceId]: 1990,
    [PLANS.annual.priceId]: 19900,
    [PLANS.topMonthly.priceId]: 3990,
    [PLANS.topAnnual.priceId]: 39900,
  };

  const PLAN_LABELS: Record<keyof typeof PLANS, string> = {
    monthly: `${L.devoto} ${L.monthly} (R$ 19,90/${L.perMonth})`,
    annual: `${L.devoto} ${L.annual} (R$ 199/${L.perYear})`,
    topMonthly: `${L.iluminado} ${L.monthly} (R$ 39,90/${L.perMonth})`,
    topAnnual: `${L.iluminado} ${L.annual} (R$ 399/${L.perYear})`,
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
      toast({ title: L.success });
      (async () => {
        await checkSub();
        await refreshProfile();
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
        throw new Error(resp.data?.error || L.sessionError);
      }
    } catch (e: any) {
      toast({ title: L.error, description: e.message, variant: 'destructive' });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleClickPlan = (planKey: keyof typeof PLANS) => {
    if (!user) { navigate('/auth'); return; }

    if (!subscription?.subscribed) {
      handleSubscribe(planKey);
      return;
    }

    const currentPriceId = getCurrentPriceId();
    const newPriceId = PLANS[planKey].priceId;
    if (currentPriceId === newPriceId) return;

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
      if (resp.error) throw new Error(resp.error.message || L.planChangeError);
      if (resp.data?.error) throw new Error(resp.data.error);

      toast({
        title: pendingChange.type === 'upgrade' ? L.upgradeOk : L.downgradeOk,
        description: resp.data?.message || L.planChanged,
      });
      await checkSub();
      await refreshProfile();
      setPendingChange(null);
    } catch (e: any) {
      toast({ title: L.error, description: e.message, variant: 'destructive' });
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
          ? new Date(resp.data.cancel_at).toLocaleDateString(L.locale)
          : L.cancelEnd;
        toast({
          title: L.cancelled,
          description: L.cancelKeepUntil(endDate),
        });
        await checkSub();
        await refreshProfile();
      } else {
        throw new Error(resp.data?.error || L.cancelError);
      }
    } catch (e: any) {
      toast({ title: L.error, description: e.message, variant: 'destructive' });
    } finally {
      setLoadingCancel(false);
    }
  };

  const CancelButton = () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 mt-2" disabled={loadingCancel}>
          {loadingCancel ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Ban className="h-4 w-4 mr-2" />}
          {L.cancelBtn}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{L.cancelTitle}</AlertDialogTitle>
          <AlertDialogDescription>{L.cancelDesc}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{L.keepSub}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {L.yesCancel}
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
        {isOnboarding && user && (
          <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-center">
            <p className="text-sm text-foreground/90 leading-relaxed">
              ✨ <strong>{L.welcomeOnboarding}</strong> {L.welcomeBody}
            </p>
            <Button
              onClick={handleContinueTrial}
              variant="outline"
              className="mt-3 w-full border-primary/40 text-primary hover:bg-primary/10"
            >
              {L.continueFree}
            </Button>
          </div>
        )}

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 ring-1 ring-primary/20">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">
            {L.chooseTitle}
          </h1>
          <p className="text-sm text-muted-foreground">{L.chooseSub}</p>
        </div>

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
            {L.monthly}
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
            {L.annual}
            <span className="absolute -top-2 -right-2 bg-green-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
              -17%
            </span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Free */}
          <div className={cn(
            "rounded-2xl border p-5 transition-all",
            !isSubscribed ? "border-primary/30 bg-primary/5" : "border-border/50 bg-card"
          )}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">{L.free}</h3>
                <p className="text-xs text-muted-foreground">{L.freeDesc}</p>
              </div>
              <span className="text-2xl font-bold font-display text-foreground">R$0</span>
            </div>
            <div className="space-y-2 mb-4">
              {L.free_features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
              {L.free_limits.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground/60">
                  <X className="h-3.5 w-3.5 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            {!isSubscribed && (
              <Button variant="outline" className="w-full" disabled>
                {L.currentPlan}
              </Button>
            )}
          </div>

          {/* Devoto */}
          <div className={cn(
            "rounded-2xl border-2 p-5 transition-all relative",
            isPremiumUser ? "border-primary bg-primary/5 shadow-lg" : "border-primary/50 bg-card"
          )}>
            {!isSubscribed && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                {L.mostPopular}
              </div>
            )}
            <div className="flex items-center justify-between mb-3 mt-1">
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">{L.devoto}</h3>
                <p className="text-xs text-muted-foreground">{L.devotoDesc}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-display text-foreground">
                  {billingCycle === 'monthly' ? 'R$19,90' : 'R$199'}
                </span>
                <span className="text-xs text-muted-foreground block">
                  /{billingCycle === 'monthly' ? L.perMonth : L.perYear}
                </span>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {L.pro_features.map((f) => (
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
                  {L.manage}
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
                {isSubscribed ? L.changeDevoto : L.subscribeDevoto}
              </Button>
            )}
          </div>

          {/* TOP */}
          <div className={cn(
            "rounded-2xl border-2 p-5 transition-all relative",
            isTopUser ? "border-amber-500 bg-amber-500/5 shadow-lg" : "border-amber-500/30 bg-card"
          )}>
            <div className="absolute -top-3 right-4 bg-amber-500 text-black px-3 py-1 rounded-full text-xs font-bold">
              TOP
            </div>
            <div className="flex items-center justify-between mb-3 mt-1">
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">{L.iluminado}</h3>
                <p className="text-xs text-muted-foreground">{L.iluminadoDesc}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-display text-foreground">
                  {billingCycle === 'monthly' ? 'R$39,90' : 'R$399'}
                </span>
                <span className="text-xs text-muted-foreground block">
                  /{billingCycle === 'monthly' ? L.perMonth : L.perYear}
                </span>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {L.pro_features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
              {L.top_extras.map((f) => (
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
                  {L.manage}
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
                {isSubscribed ? L.changeIluminado : L.subscribeIluminado}
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          {L.payFooter}
        </p>
      </div>

      <AlertDialog open={!!pendingChange} onOpenChange={(open) => !open && setPendingChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingChange?.type === 'upgrade' ? L.confirmUpgrade : L.confirmDowngrade}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 pt-2">
              {pendingChange?.type === 'upgrade' ? (
                <>
                  <span className="block">
                    {L.upgradingTo} <strong>{pendingChange?.label}</strong>.
                  </span>
                  <span className="block">{L.upgradeProrate}</span>
                  <span className="block">{L.upgradeNext}</span>
                  <span className="block text-foreground/80">{L.upgradeImmediate}</span>
                </>
              ) : (
                <>
                  <span className="block">
                    {L.downgradeKeep}
                    {subscription?.subscription_end && (
                      <> (<strong>{new Date(subscription.subscription_end).toLocaleDateString(L.locale)}</strong>)</>
                    )}.
                  </span>
                  <span className="block text-destructive font-medium">{L.downgradeNoRefund}</span>
                  <span className="block">
                    {L.downgradeAfter} <strong>{pendingChange?.label}</strong>.
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loadingChange}>{L.cancelChange}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); confirmChangePlan(); }}
              disabled={loadingChange}
            >
              {loadingChange && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {pendingChange?.type === 'upgrade' ? L.confirmUpgradeBtn : L.confirmDowngradeBtn}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
