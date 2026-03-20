import { useApp } from '@/contexts/AppContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { t } from '@/lib/i18n';
import { User, Mail, BookOpen, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, language, isSubscriber } = useApp();
  const [profile, setProfile] = useState<{
    display_name: string | null;
    preferred_religion: string | null;
    questions_used: number;
    questions_limit: number;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('display_name, preferred_religion, questions_used, questions_limit')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data);
      });
  }, [user]);

  if (!user || !profile) return null;

  const religionLabel = profile.preferred_religion
    ? t(`religion.${profile.preferred_religion}`, language) || profile.preferred_religion
    : 'Não definida';

  const planLabel = isSubscriber ? 'Pro ⭐' : 'Gratuito';

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-md mx-auto px-4 py-8 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            {profile.display_name || 'Usuário'}
          </h1>
        </div>

        {/* Info cards */}
        <div className="space-y-3">
          <InfoRow
            icon={<Mail className="h-5 w-5 text-primary/70" />}
            label="Email"
            value={user.email || '—'}
          />
          <InfoRow
            icon={<BookOpen className="h-5 w-5 text-primary/70" />}
            label="Tradição"
            value={religionLabel}
          />
          <InfoRow
            icon={<Crown className="h-5 w-5 text-primary/70" />}
            label="Plano"
            value={planLabel}
          />
          <InfoRow
            icon={<Sparkles className="h-5 w-5 text-primary/70" />}
            label="Perguntas usadas"
            value={`${profile.questions_used} / ${profile.questions_limit}`}
          />
        </div>

        {/* Upgrade CTA */}
        {!isSubscriber && (
          <Link to="/pricing" className="block">
            <Button className="w-full h-12 text-base sacred-gradient text-primary-foreground border-0 gap-2">
              <Sparkles className="h-5 w-5" />
              Fazer Upgrade Pro
            </Button>
          </Link>
        )}
      </div>
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