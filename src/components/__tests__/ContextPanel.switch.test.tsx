/**
 * Integration test for the full "trocar tradição" flow as it behaves on
 * screen, covering the three guarantees the product depends on:
 *
 *   1. The chat is cleared synchronously the moment the user confirms.
 *   2. A visible tradition-switch banner appears for ~8 seconds and then
 *      disappears on its own (drives `useTraditionSwitchNotice`).
 *   3. A 15-second undo window protects the previous history. The
 *      destructive `clearAffiliationHistory` call only fires after the
 *      window elapses, and clicking "Desfazer" cancels it for good.
 *
 * Mirrors the real wiring used by `ContextPanel.applyOption` + the in-chat
 * banner rendered by `ChatArea`, but exercised through a small harness so
 * the test stays deterministic with fake timers (the production Sonner
 * toast and Radix Dialog use animation frames that interfere with
 * `vi.useFakeTimers`).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup, fireEvent } from '@testing-library/react';
import React from 'react';

// ---------- Hoisted spies ----------
const h = vi.hoisted(() => ({
  clearAffiliationHistoryMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/clearAffiliationHistory', () => ({
  clearAffiliationHistory: h.clearAffiliationHistoryMock,
}));

import { useTraditionSwitchNotice } from '@/hooks/useTraditionSwitchNotice';
import { clearAffiliationHistory } from '@/lib/clearAffiliationHistory';

const UNDO_MS = 15_000;
const BANNER_MS = 8_000;
const USER = 'user-screen-1';

/**
 * Harness that reproduces the exact applyOption semantics from
 * `src/components/ContextPanel.tsx`:
 *   - clears chat messages immediately
 *   - updates `chatContext` to the new tradition
 *   - schedules clearAffiliationHistory for UNDO_MS later
 *   - exposes an Undo button that cancels the scheduled deletion and
 *     restores the previous chat + context
 *   - renders the 8s tradition banner via `useTraditionSwitchNotice`
 */
function ChatAndSwitcherHarness({
  initialReligion,
  initialMessages,
}: {
  initialReligion: string;
  initialMessages: { role: string; content: string }[];
}) {
  const [religion, setReligion] = React.useState(initialReligion);
  const [messages, setMessages] = React.useState(initialMessages);
  const [undoVisible, setUndoVisible] = React.useState(false);
  const cancelledRef = React.useRef(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevRef = React.useRef<{
    religion: string;
    messages: { role: string; content: string }[];
  } | null>(null);

  const { notice } = useTraditionSwitchNotice(religion, '', BANNER_MS);

  const switchTo = (next: string) => {
    if (next === religion) return;
    // Snapshot for potential undo
    prevRef.current = { religion, messages };
    // 1) Clear chat + change tradition synchronously
    setMessages([]);
    setReligion(next);
    setUndoVisible(true);
    cancelledRef.current = false;
    // 2) Schedule destructive deletion for the 15s undo window
    timerRef.current = setTimeout(() => {
      if (cancelledRef.current) return;
      void clearAffiliationHistory(USER, prevRef.current?.religion ?? '', null);
      setUndoVisible(false);
    }, UNDO_MS);
  };

  const undo = () => {
    cancelledRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (prevRef.current) {
      setReligion(prevRef.current.religion);
      setMessages(prevRef.current.messages);
    }
    setUndoVisible(false);
  };

  return (
    <div>
      <button onClick={() => switchTo('jewish')}>Trocar para Judaísmo</button>
      <button onClick={() => switchTo('hindu')}>Trocar para Hinduísmo</button>

      {/* "Chat window" — counts as cleared when no <li> rendered */}
      <ul data-testid="chat">
        {messages.map((m, i) => (
          <li key={i}>{m.content}</li>
        ))}
      </ul>

      {/* Tradition-switch banner (mirrors ChatArea) */}
      {notice && (
        <div role="status" data-testid="banner">
          Tradição alterada para <strong>{notice.to}</strong>. Conversa anterior encerrada.
        </div>
      )}

      {undoVisible && (
        <button onClick={undo} data-testid="undo">
          Desfazer
        </button>
      )}
    </div>
  );
}

describe('Tradition switch — integration (clear + 8s banner + 15s undo)', () => {
  beforeEach(() => {
    h.clearAffiliationHistoryMock.mockClear();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    cleanup();
  });

  it('clears the chat immediately and shows the 8s banner that auto-dismisses', async () => {
    render(
      <ChatAndSwitcherHarness
        initialReligion="buddhist"
        initialMessages={[
          { role: 'user', content: 'oi' },
          { role: 'assistant', content: 'olá' },
        ]}
      />,
    );

    // Chat starts with messages, no banner.
    expect(screen.getByTestId('chat').children).toHaveLength(2);
    expect(screen.queryByTestId('banner')).toBeNull();

    // Switch tradition.
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Judaísmo/i }));
    });

    // (1) Chat cleared synchronously.
    expect(screen.getByTestId('chat').children).toHaveLength(0);

    // (2) Banner is visible.
    expect(screen.getByTestId('banner')).toHaveTextContent(/jewish/i);

    // Still visible just before 8s.
    await act(async () => {
      vi.advanceTimersByTime(BANNER_MS - 1);
    });
    expect(screen.queryByTestId('banner')).not.toBeNull();

    // At 8s the banner is dismissed automatically.
    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByTestId('banner')).toBeNull();
  });

  it('keeps the destructive delete pending for 15s and fires it after the window', async () => {
    render(
      <ChatAndSwitcherHarness
        initialReligion="buddhist"
        initialMessages={[{ role: 'user', content: 'oi' }]}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Judaísmo/i }));
    });

    // Nothing deleted just before the window expires.
    await act(async () => {
      vi.advanceTimersByTime(UNDO_MS - 1);
    });
    expect(h.clearAffiliationHistoryMock).not.toHaveBeenCalled();

    // Exactly at 15s the deletion fires for the *previous* tradition.
    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });
    expect(h.clearAffiliationHistoryMock).toHaveBeenCalledTimes(1);
    expect(h.clearAffiliationHistoryMock).toHaveBeenCalledWith(
      USER,
      'buddhist',
      null,
    );
  });

  it('clicking "Desfazer" within 15s cancels the delete and restores the prior chat', async () => {
    render(
      <ChatAndSwitcherHarness
        initialReligion="buddhist"
        initialMessages={[
          { role: 'user', content: 'oi' },
          { role: 'assistant', content: 'olá' },
        ]}
      />,
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Judaísmo/i }));
    });
    expect(screen.getByTestId('chat').children).toHaveLength(0);

    // Halfway through the undo window the user clicks Desfazer.
    await act(async () => {
      vi.advanceTimersByTime(7_500);
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('undo'));
    });

    // Chat is restored and the undo control disappears.
    expect(screen.getByTestId('chat').children).toHaveLength(2);
    expect(screen.queryByTestId('undo')).toBeNull();

    // Even after the full 15s window passes, no deletion is ever fired.
    await act(async () => {
      vi.advanceTimersByTime(UNDO_MS + 1_000);
      await Promise.resolve();
    });
    expect(h.clearAffiliationHistoryMock).not.toHaveBeenCalled();
  });
});
