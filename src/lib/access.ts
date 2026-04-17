// Centralized access control: trial / subscriber / admin / expired
// Single source of truth — used by AppContext and ChatArea.

export type AccessStatus = 'trial' | 'subscriber' | 'admin' | 'expired' | 'anon';

export interface AccessProfile {
  is_subscriber?: boolean | null;
  is_pro?: boolean | null;
  trial_ends_at?: string | null;
  questions_limit?: number | null;
  questions_used?: number | null;
}

// Detects Lovable preview/sandbox environment — grants full access automatically there.
// Broad on purpose: any lovable.* host, any lovableproject host, or localhost.
export function isPreviewEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return (
    host.includes('lovable.app') ||
    host.includes('lovableproject.com') ||
    host.includes('lovable.dev') ||
    host === 'localhost' ||
    host === '127.0.0.1'
  );
}

export function computeAccess(
  profile: AccessProfile | null,
  isAdmin: boolean,
): { status: AccessStatus; trialDaysLeft: number; trialMsLeft: number } {
  if (!profile) return { status: 'anon', trialDaysLeft: 0, trialMsLeft: 0 };
  // Preview environment: always grant subscriber-level access
  if (isPreviewEnvironment()) return { status: 'subscriber', trialDaysLeft: 0, trialMsLeft: 0 };
  if (isAdmin) return { status: 'admin', trialDaysLeft: 0, trialMsLeft: 0 };
  if (profile.is_subscriber || profile.is_pro) {
    return { status: 'subscriber', trialDaysLeft: 0, trialMsLeft: 0 };
  }
  if (profile.trial_ends_at) {
    const ms = new Date(profile.trial_ends_at).getTime() - Date.now();
    if (ms > 0) {
      return {
        status: 'trial',
        trialMsLeft: ms,
        trialDaysLeft: Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24))),
      };
    }
  }
  return { status: 'expired', trialDaysLeft: 0, trialMsLeft: 0 };
}

export function hasActiveAccess(status: AccessStatus): boolean {
  return status === 'admin' || status === 'subscriber' || status === 'trial';
}
