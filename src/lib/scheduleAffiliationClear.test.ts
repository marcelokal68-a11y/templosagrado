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
