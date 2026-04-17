import { useApp } from '@/contexts/AppContext';
import { Sparkles, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isPreviewEnvironment } from '@/lib/access';

export default function TrialBanner() {
  const { accessStatus, trialDaysLeft } = useApp();

  // Never show paywall banners in preview/dev environments
  if (isPreviewEnvironment()) return null;

  if (accessStatus === 'trial') {
    return (
      <Link
        to="/pricing"
        className="block mx-3 mt-2 mb-1 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors px-3 py-2"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            <p className="text-xs text-foreground/80 truncate">
              <span className="font-semibold text-primary">{trialDaysLeft}</span>{' '}
              {trialDaysLeft === 1 ? 'dia grátis restante' : 'dias grátis restantes'}
            </p>
          </div>
          <span className="text-xs font-medium text-primary whitespace-nowrap">
            Assinar →
          </span>
        </div>
      </Link>
    );
  }

  if (accessStatus === 'expired') {
    return (
      <div className="mx-3 mt-2 mb-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-3">
        <div className="flex items-start gap-2 mb-2">
          <Lock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Seu período grátis terminou
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Assine para continuar conversando com o mentor.
            </p>
          </div>
        </div>
        <Link
          to="/pricing"
          className="block w-full text-center bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Ver planos
        </Link>
      </div>
    );
  }

  return null;
}
