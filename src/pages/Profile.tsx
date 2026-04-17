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
  { value: 'catholic', labelKey: 'religion.catholic' },
  { value: 'protestant', labelKey: 'religion.protestant' },
  { value: 'spiritist', labelKey: 'religion.spiritist' },
  { value: 'candomble', labelKey: 'religion.candomble' },
  { value: 'jewish', labelKey: 'religion.jewish' },
  { value: 'hindu', labelKey: 'religion.hindu' },
  { value: 'mormon', labelKey: 'religion.mormon' },
  { value: 'agnostic', labelKey: 'religion.agnostic' },
] as const;

export default function Profile() {
  const { user, language, isSubscriber, memoryEnabled, setMemoryEnabled, chatTone, setChatTone, accessStatus, trialDaysLeft, isAdmin } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === 'true';
  const [deletingMemories, setDeletingMemories] = useState(false);
  const [cancelling, setCancelling] = useState(false);
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
    if (!confirm('Tem certeza que deseja cancelar sua assinatura? Você manterá o acesso até o fim do período pago.')) return;
    setCancelling(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await supabase.functions.invoke('cancel-subscription', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (resp.error || resp.data?.error) {
        throw new Error(resp.data?.error || resp.error?.message || 'Erro ao cancelar');
      }
      toast({
        title: 'Assinatura cancelada',
        description: 'Você manterá o acesso até o fim do período pago.',
      });
      await loadSubInfo();
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    } finally {
      setCancelling(false);
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
      toast({ title: 'Nome atualizado!' });
    }
  };

  const saveReligion = async (value: string | null) => {
    if (!user || !profile) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ preferred_religion: value })
      .eq('user_id', user.id);
    setSaving(false);
    if (!error) {
      setProfile({ ...profile, preferred_religion: value });
      setEditingReligion(false);
      toast({ title: 'Tradição atualizada!' });
    }
  };

  if (!user || !profile) return null;

  const religionLabel = profile.preferred_religion
    ? t(`religion.${profile.preferred_religion}`, language) || profile.preferred_religion
    : 'Não definida';

  const planLabel = isSubscriber
    ? 'Pro ⭐'
    : accessStatus === 'trial'
      ? `Trial (${trialDaysLeft} ${trialDaysLeft === 1 ? 'dia' : 'dias'})`
      : accessStatus === 'expired'
        ? 'Expirado'
        : 'Gratuito';

  const formatEndDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
      : null;
  const cancelledEndDate = subInfo?.cancel_at_period_end ? formatEndDate(subInfo.subscription_end) : null;

  const handleSaveAndEnter = async () => {
    if (!user) return;
    const trimmed = nameValue.trim().slice(0, 100);
    if (trimmed && trimmed !== profile.display_name) {
      await supabase.from('profiles').update({ display_name: trimmed }).eq('user_id', user.id);
    }
    toast({ title: 'Bem-vindo ao Templo Sagrado! 🙏' });
    navigate('/', { replace: true });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-md mx-auto px-4 py-8 space-y-6 pb-32">
        {/* Onboarding banner */}
        {isOnboarding && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
            <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground mb-1">
              Bem-vindo(a) ao Templo Sagrado
            </p>
            <p className="text-xs text-muted-foreground leading-snug">
              Confirme seu nome e tradição para começar. Você tem <strong className="text-primary">7 dias grátis</strong> de acesso completo.
            </p>
          </div>
        )}

        {/* Avatar */}
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
                {isAdmin ? '★ Admin' : '★ Vitalício'}
              </span>
            )}
          </div>
          <h1 className="text-xl font-semibold text-foreground mt-2">
            {profile.display_name || 'Usuário'}
          </h1>
        </div>

        {/* Info cards */}
        <div className="space-y-3">
          {/* Name — editable */}
          {editingName ? (
            <div className="p-4 rounded-xl bg-card border border-primary/30 space-y-3">
              <p className="text-xs text-muted-foreground">Nome</p>
              <Input
                value={nameValue}
                onChange={e => setNameValue(e.target.value)}
                maxLength={100}
                className="text-sm"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveName} disabled={saving || !nameValue.trim()} className="gap-1.5 bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" /> Salvar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditingName(false); setNameValue(profile.display_name || ''); }}>
                  <X className="h-4 w-4" /> Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <EditableRow
              icon={<User className="h-5 w-5 text-primary/70" />}
              label="Nome"
              value={profile.display_name || 'Usuário'}
              onEdit={() => setEditingName(true)}
            />
          )}

          <InfoRow
            icon={<Mail className="h-5 w-5 text-primary/70" />}
            label="Email"
            value={user.email || '—'}
          />

          {/* Religion — editable */}
          {editingReligion ? (
            <div className="p-4 rounded-xl bg-card border border-primary/30 space-y-3">
              <p className="text-xs text-muted-foreground">
                Escolha seu caminho
                {profile.preferred_religion && (
                  <span className="ml-1 text-primary"> — sua fé está destacada</span>
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
                        <span className="text-[11px] font-medium text-primary shrink-0">★ sua tradição</span>
                      )}
                    </button>
                  );
                })}
                <button
                  onClick={() => saveReligion(null)}
                  disabled={saving}
                  className="w-full text-left px-3 py-2.5 rounded-lg border border-border/50 text-sm text-muted-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors"
                >
                  Prefiro não especificar
                </button>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setEditingReligion(false)}>
                <X className="h-4 w-4 mr-1" /> Cancelar
              </Button>
            </div>
          ) : (
            <>
              <EditableRow
                icon={<BookOpen className="h-5 w-5 text-primary/70" />}
                label="Tradição"
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
                  Limpar minha fé
                </Button>
              )}
            </>
          )}

          <InfoRow
            icon={<Crown className="h-5 w-5 text-primary/70" />}
            label="Plano"
            value={planLabel}
          />

          {/* Cancellation notice — when subscription is set to end at period end */}
          {cancelledEndDate && (
            <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Assinatura cancelada
              </p>
              <p className="text-xs text-muted-foreground leading-snug">
                Você mantém acesso completo até <strong className="text-primary">{cancelledEndDate}</strong>.
                Após essa data, sua conta voltará ao plano gratuito.
              </p>
            </div>
          )}

          <InfoRow
            icon={<Sparkles className="h-5 w-5 text-primary/70" />}
            label="Perguntas usadas"
            value={`${profile.questions_used} / ${profile.questions_limit}`}
          />

          {/* Cancel subscription — only for paying subscribers, not admin/lifetime/trial, and not already cancelled */}
          {isSubscriber && !isAdmin && accessStatus !== 'trial' && !subInfo?.cancel_at_period_end && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
              disabled={cancelling}
              onClick={handleCancelSubscription}
            >
              <X className="h-4 w-4" />
              {cancelling ? 'Cancelando...' : 'Cancelar assinatura'}
            </Button>
          )}
          {/* Chat tone preference */}
          <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-4 w-4 text-primary/70" />
              <span className="text-sm font-semibold text-foreground">Tom do Chat</span>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/50 space-y-3">
              <p className="text-xs text-muted-foreground leading-snug">
                Escolha como o mentor responde às suas mensagens.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setChatTone('concise');
                    toast({ title: 'Tom curto e direto ativado' });
                  }}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    chatTone === 'concise'
                      ? 'border-primary bg-primary/10'
                      : 'border-border/50 hover:border-primary/30 hover:bg-primary/5'
                  }`}
                >
                  <p className={`text-sm font-medium ${chatTone === 'concise' ? 'text-primary' : 'text-foreground'}`}>
                    Curto e direto
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">
                    3-4 frases, ao ponto
                  </p>
                </button>
                <button
                  onClick={() => {
                    setChatTone('reflective');
                    toast({ title: 'Tom profundo e reflexivo ativado' });
                  }}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    chatTone === 'reflective'
                      ? 'border-primary bg-primary/10'
                      : 'border-border/50 hover:border-primary/30 hover:bg-primary/5'
                  }`}
                >
                  <p className={`text-sm font-medium ${chatTone === 'reflective' ? 'text-primary' : 'text-foreground'}`}>
                    Profundo e reflexivo
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">
                    Exemplos do dia a dia
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Privacy section */}
          <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-primary/70" />
              <span className="text-sm font-semibold text-foreground">Privacidade</span>
            </div>

            {/* Memory toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Brain className="h-5 w-5 text-primary/70 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Memória do Mentor</p>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {memoryEnabled
                      ? 'O mentor lembra detalhes que você compartilhou'
                      : 'Conversas não são memorizadas entre sessões'}
                  </p>
                </div>
              </div>
              <Switch
                checked={memoryEnabled}
                onCheckedChange={v => {
                  setMemoryEnabled(v);
                  toast({ title: v ? 'Memória ativada' : 'Memória desativada' });
                }}
              />
            </div>

            {/* Delete memories button */}
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
                toast({ title: 'Todas as memórias foram apagadas' });
              }}
            >
              <Trash2 className="h-4 w-4" />
              {deletingMemories ? 'Apagando...' : 'Apagar todas as memórias'}
            </Button>
          </div>
        </div>

        {/* Upgrade CTA — hide during onboarding */}
        {!isSubscriber && !isOnboarding && (
          <Link to="/pricing" className="block">
            <Button className="w-full h-12 text-base sacred-gradient text-primary-foreground border-0 gap-2">
              <Sparkles className="h-5 w-5" />
              Fazer Upgrade Pro
            </Button>
          </Link>
        )}
      </div>

      {/* Sticky onboarding CTA */}
      {isOnboarding && (
        <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border p-4">
          <div className="max-w-md mx-auto">
            <Button
              onClick={handleSaveAndEnter}
              className="w-full h-12 text-base sacred-gradient text-primary-foreground border-0 gap-2"
            >
              Salvar e Entrar no Templo
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
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