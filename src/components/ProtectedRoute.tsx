import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Loader2 } from 'lucide-react';

// Allow unauthenticated access to chat (Index) for free trial
const FREE_TRIAL_ROUTES = ['/'];

function LoadingGate() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useApp();
  const location = useLocation();

  if (loading) return <LoadingGate />;

  // Allow free trial on chat page
  if (!user && FREE_TRIAL_ROUTES.includes(location.pathname)) {
    return <>{children}</>;
  }

  if (!user) {
    // Save intended route so we can return user there after pricing/signup
    try {
      sessionStorage.setItem('post_signup_intent', location.pathname + location.search);
    } catch {}
    return <Navigate to={`/auth?next=/pricing&intent=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
}

/**
 * AdminRoute: requires authenticated user WITH admin role.
 * Non-admins are silently redirected to home (to avoid information
 * disclosure about admin UI structure).
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useApp();
  const location = useLocation();

  if (loading) return <LoadingGate />;

  if (!user) {
    try {
      sessionStorage.setItem('post_signup_intent', location.pathname + location.search);
    } catch {}
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
