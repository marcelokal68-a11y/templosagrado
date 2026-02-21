import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Loader2 } from 'lucide-react';

// Allow unauthenticated access to chat (Index) for free trial
const FREE_TRIAL_ROUTES = ['/'];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useApp();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Allow free trial on chat page
  if (!user && FREE_TRIAL_ROUTES.includes(location.pathname)) {
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to="/landing" replace />;
  }

  return <>{children}</>;
}
