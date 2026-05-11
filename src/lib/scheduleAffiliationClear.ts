import { clearAffiliationHistory as defaultClearFn } from "@/lib/clearAffiliationHistory";

export const DEFAULT_UNDO_MS = 15000;

export interface ScheduleAffiliationClearOptions {
  userId: string;
  prevReligion?: string | null;
  prevPhilosophy?: string | null;
  delayMs?: number;
  /** Override for tests. */
  clearFn?: (
    userId: string,
    prevReligion?: string | null,
    prevPhilosophy?: string | null,
  ) => Promise<unknown> | unknown;
}

export interface ScheduledAffiliationClear {
  /** Cancel the pending deletion. Safe to call after expiration (no-op). */
  cancel: () => void;
  /** Resolves with true when the clear actually ran, false when it was cancelled. */
  done: Promise<boolean>;
}

/**
 * Schedules `clearAffiliationHistory` to run after `delayMs` (default 15s),
 * giving the UI a window to undo. Returns `cancel()` to abort and a `done`
 * promise that resolves with whether the deletion executed.
 */
export function scheduleAffiliationClear(
  opts: ScheduleAffiliationClearOptions,
): ScheduledAffiliationClear {
  const {
    userId,
    prevReligion = null,
    prevPhilosophy = null,
    delayMs = DEFAULT_UNDO_MS,
    clearFn = defaultClearFn,
  } = opts;

  let cancelled = false;
  let settled = false;
  let resolveDone!: (executed: boolean) => void;
  const done = new Promise<boolean>((resolve) => {
    resolveDone = resolve;
  });

  const timer = setTimeout(async () => {
    if (cancelled || !userId) {
      if (!settled) {
        settled = true;
        resolveDone(false);
      }
      return;
    }
    try {
      await clearFn(userId, prevReligion, prevPhilosophy);
    } finally {
      settled = true;
      resolveDone(true);
    }
  }, delayMs);

  return {
    cancel: () => {
      if (settled) return;
      cancelled = true;
      clearTimeout(timer);
      settled = true;
      resolveDone(false);
    },
    done,
  };
}
