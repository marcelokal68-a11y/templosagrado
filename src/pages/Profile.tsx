import { useApp } from '@/contexts/AppContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { t } from '@/lib/i18n';
import { User, Mail, BookOpen, Crown, Sparkles, Pencil, Check, X, Brain, Shield, Trash2, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const traditions = [
  { value: 'christian', labelKey: 'religion.christian' },
  { value: 'catholic', labelKey: 'religion.catholic' },
  { value: 'protestant', labelKey: 'religion.protestant' },
  { value: 'mormon', labelKey: 'religion.mormon' },
  { value: 'jewish', labelKey: 'religion.jewish' },
  { value: 'islam', labelKey: 'religion.islam' },
  { value: 'hindu', labelKey: 'religion.hindu' },
  { value: 'buddhist', labelKey: 'religion.buddhist' },
  { value: 'spiritist', labelKey: 'religion.spiritist' },
  { value: 'umbanda', labelKey: 'religion.umbanda' },
  { value: 'candomble', labelKey: 'religion.candomble' },
  { value: 'agnostic', labelKey: 'religion.agnostic' },
] as const;

const LABELS = {
  'pt-BR': {
    cancelError: 'Erro ao cancelar',
    reactivateError: 'Erro ao reativar',
    error: 'Erro',
    subCancelled: 'Assinatura cancelada',
    cancelDesc: 'Você manterá o acesso até o fim do período pago.',
    subReactivated: 'Assinatura reativada 🙏',
    reactivateDesc: 'Que bom ter você de volta. Sua assinatura continuará normalmente.',
    nameUpdated: 'Nome atualizado!',
    traditionUpdated: 'Tradição atualizada!',
    traditionRemoved: 'Tradição removida',
    notDefined: 'Não definida',
    pro: 'Pro ⭐',
    trial: (n: number) => `Trial (${n} ${n === 1 ? 'dia' : 'dias'})`,
    expired: 'Expirado',
    free: 'Gratuito',
    welcome: 'Bem-vindo ao Templo Sagrado! 🙏',
    onboardingTitle: 'Bem-vindo(a) ao Templo Sagrado',
    onboardingDesc1: 'Confirme seu nome e tradição para começar. Você tem',
    onboardingDays: '7 dias grátis',
    onboardingDesc2: 'de acesso completo.',
    admin: '★ Admin',
    lifetime: '★ Vitalício',
    user: 'Usuário',
    name: 'Nome',
    save: 'Salvar',
    cancel: 'Cancelar',
    email: 'Email',
    choosePath: 'Escolha seu caminho',
    yourFaithHighlighted: ' — sua fé está destacada',
    yourTradition: '★ sua tradição',
    preferNot: 'Prefiro não especificar',
    tradition: 'Tradição',
    clearMyFaith: 'Limpar minha fé',
    plan: 'Plano',
    subCancelledTitle: 'Assinatura cancelada',
    keepAccessUntil: 'Você mantém acesso completo até',
    afterReverts: 'Após essa data, sua conta voltará ao plano gratuito.',
    reactivating: 'Reativando...',
    reactivate: 'Reativar assinatura',
    questionsUsed: 'Perguntas usadas',
    cancelling: 'Cancelando...',
    cancelSub: 'Cancelar assinatura',
    chatTone: 'Tom do Chat',
    chatToneDesc: 'Escolha como o mentor responde às suas mensagens.',
    toneShortOn: 'Tom curto e direto ativado',
    toneDeepOn: 'Tom profundo e reflexivo ativado',
    short: 'Curto e direto',
    shortDesc: '3-4 frases, ao ponto',
    deep: 'Profundo e reflexivo',
    deepDesc: 'Exemplos do dia a dia',
    privacy: 'Privacidade',
    mentorMemory: 'Memória do Mentor',
    memoryOnDesc: 'O mentor lembra detalhes que você compartilhou',
    memoryOffDesc: 'Conversas não são memorizadas entre sessões',
    memoryOn: 'Memória ativada',
    memoryOff: 'Memória desativada',
    allMemoriesDeleted: 'Todas as memórias foram apagadas',
    deleting: 'Apagando...',
    deleteAllMemories: 'Apagar todas as memórias',
    upgradePro: 'Fazer Upgrade Pro',
    saveAndEnter: 'Salvar e Entrar no Templo',
    cancelSubTitle: 'Cancelar assinatura?',
    cancelSubDesc: 'Você manterá acesso completo até o fim do período já pago. Após essa data, sua conta voltará ao plano gratuito.',
    keepSub: 'Manter assinatura',
    yesCancel: 'Sim, cancelar',
    locale: 'pt-BR',
  },
  en: {
    cancelError: 'Failed to cancel',
    reactivateError: 'Failed to reactivate',
    error: 'Error',
    subCancelled: 'Subscription cancelled',
    cancelDesc: 'You will keep access until the end of the paid period.',
    subReactivated: 'Subscription reactivated 🙏',
    reactivateDesc: 'Great to have you back. Your subscription will continue normally.',
    nameUpdated: 'Name updated!',
    traditionUpdated: 'Tradition updated!',
    traditionRemoved: 'Tradition removed',
    notDefined: 'Not set',
    pro: 'Pro ⭐',
    trial: (n: number) => `Trial (${n} ${n === 1 ? 'day' : 'days'})`,
    expired: 'Expired',
    free: 'Free',
    welcome: 'Welcome to Sacred Temple! 🙏',
    onboardingTitle: 'Welcome to Sacred Temple',
    onboardingDesc1: 'Confirm your name and tradition to begin. You have',
    onboardingDays: '7 free days',
    onboardingDesc2: 'of full access.',
    admin: '★ Admin',
    lifetime: '★ Lifetime',
    user: 'User',
    name: 'Name',
    save: 'Save',
    cancel: 'Cancel',
    email: 'Email',
    choosePath: 'Choose your path',
    yourFaithHighlighted: ' — your faith is highlighted',
    yourTradition: '★ your tradition',
    preferNot: 'Prefer not to say',
    tradition: 'Tradition',
    clearMyFaith: 'Clear my faith',
    plan: 'Plan',
    subCancelledTitle: 'Subscription cancelled',
    keepAccessUntil: 'You keep full access until',
    afterReverts: 'After that date, your account will revert to the free plan.',
    reactivating: 'Reactivating...',
    reactivate: 'Reactivate subscription',
    questionsUsed: 'Questions used',
    cancelling: 'Cancelling...',
    cancelSub: 'Cancel subscription',
    chatTone: 'Chat Tone',
    chatToneDesc: 'Choose how the mentor responds to your messages.',
    toneShortOn: 'Short and direct tone enabled',
    toneDeepOn: 'Deep and reflective tone enabled',
    short: 'Short and direct',
    shortDesc: '3-4 sentences, to the point',
    deep: 'Deep and reflective',
    deepDesc: 'Everyday examples',
    privacy: 'Privacy',
    mentorMemory: 'Mentor Memory',
    memoryOnDesc: 'The mentor remembers details you shared',
    memoryOffDesc: 'Conversations are not remembered between sessions',
    memoryOn: 'Memory enabled',
    memoryOff: 'Memory disabled',
    allMemoriesDeleted: 'All memories deleted',
    deleting: 'Deleting...',
    deleteAllMemories: 'Delete all memories',
    upgradePro: 'Upgrade to Pro',
    saveAndEnter: 'Save and Enter Temple',
    cancelSubTitle: 'Cancel subscription?',
    cancelSubDesc: 'You will keep full access until the end of the period already paid. After that date, your account will revert to the free plan.',
    keepSub: 'Keep subscription',
    yesCancel: 'Yes, cancel',
    locale: 'en-US',
  },
  es: {
    cancelError: 'Error al cancelar',
    reactivateError: 'Error al reactivar',
    error: 'Error',
    subCancelled: 'Suscripción cancelada',
    cancelDesc: 'Conservarás el acceso hasta el fin del período pagado.',
    subReactivated: 'Suscripción reactivada 🙏',
    reactivateDesc: 'Qué bueno tenerte de vuelta. Tu suscripción continuará normalmente.',
    nameUpdated: '¡Nombre actualizado!',
    traditionUpdated: '¡Tradición actualizada!',
    traditionRemoved: 'Tradición removida',
    notDefined: 'No definida',
    pro: 'Pro ⭐',
    trial: (n: number) => `Trial (${n} ${n === 1 ? 'día' : 'días'})`,
    expired: 'Expirado',
    free: 'Gratis',
    welcome: '¡Bienvenido a Templo Sagrado! 🙏',
    onboardingTitle: 'Bienvenido a Templo Sagrado',
    onboardingDesc1: 'Confirma tu nombre y tradición para comenzar. Tienes',
    onboardingDays: '7 días gratis',
    onboardingDesc2: 'de acceso completo.',
    admin: '★ Admin',
    lifetime: '★ Vitalicio',
    user: 'Usuario',
    name: 'Nombre',
    save: 'Guardar',
    cancel: 'Cancelar',
    email: 'Email',
    choosePath: 'Elige tu camino',
    yourFaithHighlighted: ' — tu fe está destacada',
    yourTradition: '★ tu tradición',
    preferNot: 'Prefiero no especificar',
    tradition: 'Tradición',
    clearMyFaith: 'Limpiar mi fe',
    plan: 'Plan',
    subCancelledTitle: 'Suscripción cancelada',
    keepAccessUntil: 'Conservas acceso completo hasta',
    afterReverts: 'Después de esa fecha, tu cuenta volverá al plan gratis.',
    reactivating: 'Reactivando...',
    reactivate: 'Reactivar suscripción',
    questionsUsed: 'Preguntas usadas',
    cancelling: 'Cancelando...',
    cancelSub: 'Cancelar suscripción',
    chatTone: 'Tono del Chat',
    chatToneDesc: 'Elige cómo el mentor responde a tus mensajes.',
    toneShortOn: 'Tono corto y directo activado',
    toneDeepOn: 'Tono profundo y reflexivo activado',
    short: 'Corto y directo',
    shortDesc: '3-4 frases, al grano',
    deep: 'Profundo y reflexivo',
    deepDesc: 'Ejemplos del día a día',
    privacy: 'Privacidad',
    mentorMemory: 'Memoria del Mentor',
    memoryOnDesc: 'El mentor recuerda detalles que compartiste',
    memoryOffDesc: 'Las conversaciones no se recuerdan entre sesiones',
    memoryOn: 'Memoria activada',
    memoryOff: 'Memoria desactivada',
    allMemoriesDeleted: 'Todas las memorias fueron borradas',
    deleting: 'Borrando...',
    deleteAllMemories: 'Borrar todas las memorias',
    upgradePro: 'Mejorar a Pro',
    saveAndEnter: 'Guardar y Entrar al Templo',
    cancelSubTitle: '¿Cancelar suscripción?',
    cancelSubDesc: 'Conservarás acceso completo hasta el fin del período ya pagado. Después de esa fecha, tu cuenta volverá al plan gratis.',
    keepSub: 'Mantener suscripción',
    yesCancel: 'Sí, cancelar',
    locale: 'es-ES',
  },
};

export default function Profile() {
  const { user, language, isSubscriber, memoryEnabled, setMemoryEnabled, chatTone, setChatTone, accessStatus, trialDaysLeft, isAdmin, refreshProfile, setChatContext, setMessages } = useApp();
  const L = LABELS[language] || LABELS['pt-BR'];
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === 'true';
  const [deletingMemories, setDeletingMemories] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [subInfo, setSubInfo] = useState<{
    cancel_at_period_end: boolean;
    subscription_end: string | null;
  } | null>(null);

  const loadSubInfo = async () => {
    if (!isSubscriber) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.functions.invoke('check-subscription', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (data && !data.error) {
        setSubInfo({
          cancel_at_period_end: !!data.cancel_at_period_end,
          subscription_end: data.subscription_end ?? null,
        });
      }
    } catch (e) {
      console.error('[Profile] Failed to load sub info:', e);
    }
  };

  useEffect(() => {
    loadSubInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubscriber, user?.id]);

  const handleCancelSubscription = async () => {
    setConfirmCancelOpen(false);
    setCancelling(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await supabase.functions.invoke('cancel-subscription', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (resp.error || resp.data?.error) {
        throw new Error(resp.data?.error || resp.error?.message || L.cancelError);
      }
      toast({ title: L.subCancelled, description: L.cancelDesc });
      await loadSubInfo();
    } catch (e: any) {
      toast({ title: L.error, description: e.message, variant: 'destructive' });
    } finally {
      setCancelling(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setReactivating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await supabase.functions.invoke('reactivate-subscription', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (resp.error || resp.data?.error) {
        throw new Error(resp.data?.error || resp.error?.message || L.reactivateError);
      }
      toast({ title: L.subReactivated, description: L.reactivateDesc });
      await loadSubInfo();
    } catch (e: any) {
      toast({ title: L.error, description: e.message, variant: 'destructive' });
    } finally {
      setReactivating(false);
    }
  };

  const [profile, setProfile] = useState<{
    display_name: string | null;
    preferred_religion: string | null;
    questions_used: number;
    questions_limit: number;
  } | null>(null);

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [editingReligion, setEditingReligion] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingReligion, setPendingReligion] = useState<{ value: string | null } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('display_name, preferred_religion, questions_used, questions_limit')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          setNameValue(data.display_name || '');
        }
      });
  }, [user]);

  const saveName = async () => {
    if (!user || !profile) return;
    const trimmed = nameValue.trim().slice(0, 100);
    if (!trimmed) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: trimmed })
      .eq('user_id', user.id);
    setSaving(false);
    if (!error) {
      setProfile({ ...profile, display_name: trimmed });
      setEditingName(false);
      toast({ title: L.nameUpdated });
    }
  };

  const saveReligion = async (value: string | null) => {
    if (!user || !profile) return;
    // If switching to a different tradition (and one already exists), confirm first
    const prev = profile.preferred_religion;
    if (prev && prev !== value) {
      setPendingReligion({ value });
      return;
    }
    await applyReligionChange(value);
  };

  const applyReligionChange = async (value: string | null) => {
    if (!user || !profile) return;
    const prev = profile.preferred_religion;
    setSaving(true);
    if (prev && prev !== value) {
      const { clearAffiliationHistory } = await import('@/lib/clearAffiliationHistory');
      await clearAffiliationHistory(user.id, prev, null);
    }
    const { error } = await supabase
      .from('profiles')
      .update({ preferred_religion: value })
      .eq('user_id', user.id);
    setSaving(false);
    if (!error) {
      setProfile({ ...profile, preferred_religion: value });
      setEditingReligion(false);
      setMessages([]);
      setChatContext(prev => ({ ...prev, religion: value || '', philosophy: '', topic: '' }));
      await refreshProfile();
      toast({
        title: prev && prev !== value
          ? t('faith.switch_done', language)
          : (value ? L.traditionUpdated : L.traditionRemoved),
      });
    }
  };

  if (!user || !profile) return null;

  const religionLabel = profile.preferred_religion
    ? t(`religion.${profile.preferred_religion}`, language) || profile.preferred_religion
    : L.notDefined;

  const planLabel = isSubscriber
    ? L.pro
    : accessStatus === 'trial'
      ? L.trial(trialDaysLeft)
      : accessStatus === 'expired'
        ? L.expired
        : L.free;

  const formatEndDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString(L.locale, { day: '2-digit', month: 'long', year: 'numeric' })
      : null;
  const cancelledEndDate = subInfo?.cancel_at_period_end ? formatEndDate(subInfo.subscription_end) : null;

  const handleSaveAndEnter = async () => {
    if (!user) return;
    const trimmed = nameValue.trim().slice(0, 100);
    if (trimmed && trimmed !== profile.display_name) {
      await supabase.from('profiles').update({ display_name: trimmed }).eq('user_id', user.id);
    }
    toast({ title: L.welcome });
    navigate('/', { replace: true });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-md mx-auto px-4 py-8 space-y-6 pb-32">
        {isOnboarding && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
            <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground mb-1">{L.onboardingTitle}</p>
            <p className="text-xs text-muted-foreground leading-snug">
              {L.onboardingDesc1} <strong className="text-primary">{L.onboardingDays}</strong> {L.onboardingDesc2}
            </p>
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
              <User className="h-10 w-10 text-primary" />
            </div>
            {(isAdmin || (isSubscriber && accessStatus !== 'trial')) && (
              <span
                className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap shadow-sm ring-1 ${
                  isAdmin
                    ? 'bg-primary text-primary-foreground ring-primary/40'
                    : 'bg-amber-500/90 text-white ring-amber-400/40'
                }`}
              >
                {isAdmin ? L.admin : L.lifetime}
              </span>
            )}
          </div>
          <h1 className="text-xl font-semibold text-foreground mt-2">
            {profile.display_name || L.user}
          </h1>
        </div>

        <div className="space-y-3">
          {editingName ? (
            <div className="p-4 rounded-xl bg-card border border-primary/30 space-y-3">
              <p className="text-xs text-muted-foreground">{L.name}</p>
              <Input
                value={nameValue}
                onChange={e => setNameValue(e.target.value)}
                maxLength={100}
                className="text-sm"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveName} disabled={saving || !nameValue.trim()} className="gap-1.5 bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" /> {L.save}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditingName(false); setNameValue(profile.display_name || ''); }}>
                  <X className="h-4 w-4" /> {L.cancel}
                </Button>
              </div>
            </div>
          ) : (
            <EditableRow
              icon={<User className="h-5 w-5 text-primary/70" />}
              label={L.name}
              value={profile.display_name || L.user}
              onEdit={() => setEditingName(true)}
            />
          )}

          <InfoRow
            icon={<Mail className="h-5 w-5 text-primary/70" />}
            label={L.email}
            value={user.email || '—'}
          />

          {editingReligion ? (
            <div className="p-4 rounded-xl bg-card border border-primary/30 space-y-3">
              <p className="text-xs text-muted-foreground">
                {L.choosePath}
                {profile.preferred_religion && (
                  <span className="ml-1 text-primary">{L.yourFaithHighlighted}</span>
                )}
              </p>
              <div className="space-y-2">
                {traditions.map(tr => {
                  const isSaved = profile.preferred_religion === tr.value;
                  const isDimmed = !!profile.preferred_religion && !isSaved;
                  return (
                    <button
                      key={tr.value}
                      onClick={() => saveReligion(tr.value)}
                      disabled={saving}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all ${
                        isSaved
                          ? 'border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/40'
                          : isDimmed
                            ? 'border-border/40 text-foreground/70 opacity-50 hover:opacity-100 hover:border-primary/30 hover:bg-primary/5'
                            : 'border-border/50 hover:border-primary/30 hover:bg-primary/5 text-foreground/80'
                      }`}
                    >
                      <span>{t(tr.labelKey, language)}</span>
                      {isSaved && (
                        <span className="text-[11px] font-medium text-primary shrink-0">{L.yourTradition}</span>
                      )}
                    </button>
                  );
                })}
                <button
                  onClick={() => saveReligion(null)}
                  disabled={saving}
                  className="w-full text-left px-3 py-2.5 rounded-lg border border-border/50 text-sm text-muted-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors"
                >
                  {L.preferNot}
                </button>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setEditingReligion(false)}>
                <X className="h-4 w-4 mr-1" /> {L.cancel}
              </Button>
            </div>
          ) : (
            <>
              <EditableRow
                icon={<BookOpen className="h-5 w-5 text-primary/70" />}
                label={L.tradition}
                value={profile.preferred_religion ? `★ ${religionLabel}` : religionLabel}
                onEdit={() => setEditingReligion(true)}
              />
              {profile.preferred_religion && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground hover:text-destructive gap-1.5 h-8"
                  disabled={saving}
                  onClick={() => saveReligion(null)}
                >
                  <X className="h-3.5 w-3.5" />
                  {L.clearMyFaith}
                </Button>
              )}
            </>
          )}

          <InfoRow
            icon={<Crown className="h-5 w-5 text-primary/70" />}
            label={L.plan}
            value={planLabel}
          />

          {cancelledEndDate && (
            <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{L.subCancelledTitle}</p>
                <p className="text-xs text-muted-foreground leading-snug">
                  {L.keepAccessUntil} <strong className="text-primary">{cancelledEndDate}</strong>.
                  {' '}{L.afterReverts}
                </p>
              </div>
              <Button
                size="sm"
                className="w-full gap-2"
                disabled={reactivating}
                onClick={handleReactivateSubscription}
              >
                <Sparkles className="h-4 w-4" />
                {reactivating ? L.reactivating : L.reactivate}
              </Button>
            </div>
          )}

          <InfoRow
            icon={<Sparkles className="h-5 w-5 text-primary/70" />}
            label={L.questionsUsed}
            value={`${profile.questions_used} / ${profile.questions_limit}`}
          />

          {isSubscriber && !isAdmin && accessStatus !== 'trial' && !subInfo?.cancel_at_period_end && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
              disabled={cancelling}
              onClick={() => setConfirmCancelOpen(true)}
            >
              <X className="h-4 w-4" />
              {cancelling ? L.cancelling : L.cancelSub}
            </Button>
          )}
          <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-4 w-4 text-primary/70" />
              <span className="text-sm font-semibold text-foreground">{L.chatTone}</span>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/50 space-y-3">
              <p className="text-xs text-muted-foreground leading-snug">{L.chatToneDesc}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setChatTone('concise');
                    toast({ title: L.toneShortOn });
                  }}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    chatTone === 'concise'
                      ? 'border-primary bg-primary/10'
                      : 'border-border/50 hover:border-primary/30 hover:bg-primary/5'
                  }`}
                >
                  <p className={`text-sm font-medium ${chatTone === 'concise' ? 'text-primary' : 'text-foreground'}`}>
                    {L.short}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">{L.shortDesc}</p>
                </button>
                <button
                  onClick={() => {
                    setChatTone('reflective');
                    toast({ title: L.toneDeepOn });
                  }}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    chatTone === 'reflective'
                      ? 'border-primary bg-primary/10'
                      : 'border-border/50 hover:border-primary/30 hover:bg-primary/5'
                  }`}
                >
                  <p className={`text-sm font-medium ${chatTone === 'reflective' ? 'text-primary' : 'text-foreground'}`}>
                    {L.deep}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">{L.deepDesc}</p>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-primary/70" />
              <span className="text-sm font-semibold text-foreground">{L.privacy}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Brain className="h-5 w-5 text-primary/70 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">{L.mentorMemory}</p>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {memoryEnabled ? L.memoryOnDesc : L.memoryOffDesc}
                  </p>
                </div>
              </div>
              <Switch
                checked={memoryEnabled}
                onCheckedChange={v => {
                  setMemoryEnabled(v);
                  toast({ title: v ? L.memoryOn : L.memoryOff });
                }}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
              disabled={deletingMemories}
              onClick={async () => {
                if (!user) return;
                setDeletingMemories(true);
                await supabase.from('user_memory').delete().eq('user_id', user.id);
                setDeletingMemories(false);
                toast({ title: L.allMemoriesDeleted });
              }}
            >
              <Trash2 className="h-4 w-4" />
              {deletingMemories ? L.deleting : L.deleteAllMemories}
            </Button>
          </div>
        </div>

        {!isSubscriber && !isOnboarding && (
          <Link to="/pricing" className="block">
            <Button className="w-full h-12 text-base sacred-gradient text-primary-foreground border-0 gap-2">
              <Sparkles className="h-5 w-5" />
              {L.upgradePro}
            </Button>
          </Link>
        )}
      </div>

      {isOnboarding && (
        <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border p-4">
          <div className="max-w-md mx-auto">
            <Button
              onClick={handleSaveAndEnter}
              className="w-full h-12 text-base sacred-gradient text-primary-foreground border-0 gap-2"
            >
              {L.saveAndEnter}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{L.cancelSubTitle}</AlertDialogTitle>
            <AlertDialogDescription>{L.cancelSubDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{L.keepSub}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {L.yesCancel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!pendingReligion} onOpenChange={(open) => { if (!open) setPendingReligion(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('faith.switch_title', language)}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('faith.switch_desc', language)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingReligion(null)}>
              {t('faith.switch_cancel', language)}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const v = pendingReligion?.value ?? null;
                setPendingReligion(null);
                await applyReligionChange(v);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('faith.switch_confirm', language)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50">
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

function EditableRow({ icon, label, value, onEdit }: { icon: React.ReactNode; label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50">
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
      <button onClick={onEdit} className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  );
}
