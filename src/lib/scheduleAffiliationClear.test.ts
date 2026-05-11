import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the default clear implementation so importing the helper doesn't
// pull the real Supabase client.
vi.mock("@/lib/clearAffiliationHistory", () => ({
  clearAffiliationHistory: vi.fn(async () => {}),
}));

import {
  scheduleAffiliationClear,
  DEFAULT_UNDO_MS,
} from "./scheduleAffiliationClear";

describe("scheduleAffiliationClear", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("defers deletion — clearFn is not called synchronously", () => {
    const clearFn = vi.fn(async () => {});
    scheduleAffiliationClear({
      userId: "user-1",
      prevReligion: "christianity",
      clearFn,
    });
    expect(clearFn).not.toHaveBeenCalled();
  });

  it("does not call clearFn before the 15s window elapses", () => {
    const clearFn = vi.fn(async () => {});
    scheduleAffiliationClear({
      userId: "user-1",
      prevReligion: "christianity",
      clearFn,
    });
    vi.advanceTimersByTime(DEFAULT_UNDO_MS - 1);
    expect(clearFn).not.toHaveBeenCalled();
  });

  it("calls clearFn exactly once after 15s with the previous affiliation", async () => {
    const clearFn = vi.fn(async () => {});
    const { done } = scheduleAffiliationClear({
      userId: "user-1",
      prevReligion: "christianity",
      prevPhilosophy: null,
      clearFn,
    });
    await vi.advanceTimersByTimeAsync(DEFAULT_UNDO_MS);
    await expect(done).resolves.toBe(true);
    expect(clearFn).toHaveBeenCalledTimes(1);
    expect(clearFn).toHaveBeenCalledWith("user-1", "christianity", null);
  });

  it("undo before expiration cancels the deletion (clearFn never runs)", async () => {
    const clearFn = vi.fn(async () => {});
    const { cancel, done } = scheduleAffiliationClear({
      userId: "user-1",
      prevReligion: "christianity",
      clearFn,
    });
    vi.advanceTimersByTime(5000);
    cancel();
    await vi.advanceTimersByTimeAsync(DEFAULT_UNDO_MS);
    await expect(done).resolves.toBe(false);
    expect(clearFn).not.toHaveBeenCalled();
  });

  it("cancel after expiration is a no-op and doesn't re-run clearFn", async () => {
    const clearFn = vi.fn(async () => {});
    const { cancel, done } = scheduleAffiliationClear({
      userId: "user-1",
      prevReligion: "christianity",
      clearFn,
    });
    await vi.advanceTimersByTimeAsync(DEFAULT_UNDO_MS);
    await expect(done).resolves.toBe(true);
    cancel();
    expect(clearFn).toHaveBeenCalledTimes(1);
  });

  it("respects a custom delayMs", async () => {
    const clearFn = vi.fn(async () => {});
    const { done } = scheduleAffiliationClear({
      userId: "user-1",
      prevReligion: "islam",
      delayMs: 3000,
      clearFn,
    });
    vi.advanceTimersByTime(2999);
    expect(clearFn).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    await expect(done).resolves.toBe(true);
    expect(clearFn).toHaveBeenCalledTimes(1);
  });

  it("supports philosophy-only switches", async () => {
    const clearFn = vi.fn(async () => {});
    scheduleAffiliationClear({
      userId: "user-2",
      prevPhilosophy: "stoicism",
      clearFn,
    });
    await vi.advanceTimersByTimeAsync(DEFAULT_UNDO_MS);
    expect(clearFn).toHaveBeenCalledWith("user-2", null, "stoicism");
  });
});

describe("scheduleAffiliationClear — race conditions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("cancelling the previous schedule before scheduling a new one runs only the latest deletion", async () => {
    const clearFn = vi.fn(async () => {});

    // First switch: christianity -> buddhism
    const first = scheduleAffiliationClear({
      userId: "u",
      prevReligion: "christianity",
      clearFn,
    });

    vi.advanceTimersByTime(5000);

    // User switches again before the first window expires.
    // The caller MUST cancel the previous schedule.
    first.cancel();
    const second = scheduleAffiliationClear({
      userId: "u",
      prevReligion: "buddhism",
      clearFn,
    });

    await vi.advanceTimersByTimeAsync(DEFAULT_UNDO_MS);

    await expect(first.done).resolves.toBe(false);
    await expect(second.done).resolves.toBe(true);
    expect(clearFn).toHaveBeenCalledTimes(1);
    expect(clearFn).toHaveBeenCalledWith("u", "buddhism", null);
  });

  it("undo on the latest schedule does not allow an older (uncancelled) one to execute its previous-religion delete out of order", async () => {
    // Simulates a buggy caller that forgot to cancel the first schedule.
    // Even so, undoing the second must not resurrect order issues:
    // each schedule is independent and uses the snapshot it was created with.
    const clearFn = vi.fn(async () => {});

    const first = scheduleAffiliationClear({
      userId: "u",
      prevReligion: "christianity",
      delayMs: 15000,
      clearFn,
    });
    vi.advanceTimersByTime(1000);
    const second = scheduleAffiliationClear({
      userId: "u",
      prevReligion: "buddhism",
      delayMs: 15000,
      clearFn,
    });

    // Undo the latest (most recent UI action)
    vi.advanceTimersByTime(2000);
    second.cancel();

    // First schedule still fires at t=15000 with its original snapshot
    await vi.advanceTimersByTimeAsync(20000);

    await expect(second.done).resolves.toBe(false);
    await expect(first.done).resolves.toBe(true);
    expect(clearFn).toHaveBeenCalledTimes(1);
    // Crucially, it deletes ONLY christianity (its captured prev), never buddhism.
    expect(clearFn).toHaveBeenCalledWith("u", "christianity", null);
  });

  it("rapid sequential switches with proper cancellation only ever delete the oldest pending snapshot", async () => {
    const clearFn = vi.fn(async () => {});
    const traditions = ["christianity", "buddhism", "islam", "judaism"];

    let current = scheduleAffiliationClear({
      userId: "u",
      prevReligion: traditions[0],
      clearFn,
    });
    const all = [current];

    for (let i = 1; i < traditions.length; i++) {
      vi.advanceTimersByTime(2000);
      current.cancel();
      current = scheduleAffiliationClear({
        userId: "u",
        prevReligion: traditions[i],
        clearFn,
      });
      all.push(current);
    }

    await vi.advanceTimersByTimeAsync(DEFAULT_UNDO_MS);

    // Only the last schedule executes; the others were cancelled.
    for (let i = 0; i < all.length - 1; i++) {
      await expect(all[i].done).resolves.toBe(false);
    }
    await expect(all[all.length - 1].done).resolves.toBe(true);
    expect(clearFn).toHaveBeenCalledTimes(1);
    expect(clearFn).toHaveBeenCalledWith("u", "judaism", null);
  });

  it("undo after a new switch was scheduled does not re-trigger the cancelled deletion", async () => {
    const clearFn = vi.fn(async () => {});

    const first = scheduleAffiliationClear({
      userId: "u",
      prevReligion: "christianity",
      clearFn,
    });
    vi.advanceTimersByTime(3000);
    first.cancel(); // user undid
    const second = scheduleAffiliationClear({
      userId: "u",
      prevReligion: "christianity",
      clearFn,
    });

    // Calling cancel again on the already-cancelled first must not affect the second
    first.cancel();
    await vi.advanceTimersByTimeAsync(DEFAULT_UNDO_MS);

    await expect(second.done).resolves.toBe(true);
    expect(clearFn).toHaveBeenCalledTimes(1);
  });
});
