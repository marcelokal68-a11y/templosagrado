import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// ---------- Hoisted mocks ----------
const h = vi.hoisted(() => {
  return {
    clearAffiliationHistoryMock: vi.fn().mockResolvedValue(undefined),
    toastSuccessMock: vi.fn(),
    toastMock: vi.fn(),
    refreshProfileMock: vi.fn().mockResolvedValue(undefined),
    setMessagesMock: vi.fn(),
    setChatContextMock: vi.fn(),
    supabaseUpdates: [] as any[],
    state: {
      messages: [] as { role: string; content: string }[],
      chatContext: {
        religion: 'buddhist',
        need: '',
        mood: '',
        topic: '',
        philosophy: '',
      } as any,
    },
  };
});

vi.mock('@/lib/clearAffiliationHistory', () => ({
  clearAffiliationHistory: h.clearAffiliationHistoryMock,
}));

vi.mock('sonner', () => {
  const fn: any = (...args: any[]) => h.toastMock(...args);
  fn.success = h.toastSuccessMock;
  fn.error = vi.fn();
  return { toast: fn };
});

vi.mock('@/integrations/supabase/client', () => {
  const builder = () => {
    const b: any = {
      update: (payload: any) => {
        h.supabaseUpdates.push(payload);
        return b;
      },
      eq: () => Promise.resolve({ data: null, error: null }),
      delete: () => b,
      filter: () => b,
    };
    return b;
  };
  return { supabase: { from: () => builder() } };
});

vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({
    language: 'pt-BR',
    chatContext: h.state.chatContext,
    setChatContext: (next: any) => {
      h.state.chatContext =
        typeof next === 'function' ? next(h.state.chatContext) : next;
      h.setChatContextMock(next);
    },
    messages: h.state.messages,
    setMessages: (next: any) => {
      h.state.messages =
        typeof next === 'function' ? next(h.state.messages) : next;
      h.setMessagesMock(next);
    },
    preferredReligion: 'buddhist',
    user: { id: 'user-test-1' },
    refreshProfile: h.refreshProfileMock,
  }),
}));

// Import AFTER mocks
import ContextPanel from '@/components/ContextPanel';

function resetAll() {
  h.state.messages = [
    { role: 'user', content: 'oi' },
    { role: 'assistant', content: 'olá' },
  ];
  h.state.chatContext = {
    religion: 'buddhist',
    need: '',
    mood: '',
    topic: '',
    philosophy: '',
  };
  h.clearAffiliationHistoryMock.mockClear();
  h.toastSuccessMock.mockClear();
  h.toastMock.mockClear();
  h.setMessagesMock.mockClear();
  h.setChatContextMock.mockClear();
  h.refreshProfileMock.mockClear();
  h.supabaseUpdates.length = 0;
}

describe('ContextPanel — switching tradition (integration)', () => {
  beforeEach(() => {
    resetAll();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    cleanup();
  });

  async function openConfirmAndSwitch() {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <MemoryRouter>
        <ContextPanel />
      </MemoryRouter>,
    );

    // Pick a different tradition → opens the confirmation dialog
    await user.click(screen.getByRole('button', { name: /Judaísmo/i }));

    // Dialog appears with explicit clear/undo description
    expect(
      await screen.findByText(/Sua conversa atual será encerrada/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/desfazer por 15 segundos/i)).toBeInTheDocument();

    // Confirm the switch
    await user.click(
      screen.getByRole('button', { name: /Sim, trocar e limpar chat/i }),
    );

    return user;
  }

  it('clears the chat immediately, updates preferred_religion and shows undo toast', async () => {
    await openConfirmAndSwitch();

    expect(h.setMessagesMock).toHaveBeenCalledWith([]);
    expect(h.state.messages).toEqual([]);

    expect(
      h.supabaseUpdates.some((u) => u.preferred_religion === 'jewish'),
    ).toBe(true);
    expect(h.refreshProfileMock).toHaveBeenCalled();

    expect(h.toastSuccessMock).toHaveBeenCalled();
    const [, opts] = h.toastSuccessMock.mock.calls.at(-1)!;
    expect(opts.duration).toBe(15000);
    expect(opts.action.label).toMatch(/Desfazer/i);

    // Deletion not yet fired
    expect(h.clearAffiliationHistoryMock).not.toHaveBeenCalled();
  });

  it('deletes affiliation history exactly after the 15s undo window', async () => {
    await openConfirmAndSwitch();

    act(() => {
      vi.advanceTimersByTime(14_999);
    });
    expect(h.clearAffiliationHistoryMock).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(h.clearAffiliationHistoryMock).toHaveBeenCalledTimes(1);
    expect(h.clearAffiliationHistoryMock).toHaveBeenCalledWith(
      'user-test-1',
      'buddhist',
      '',
    );
  });

  it('undo cancels deletion and restores previous chat/context', async () => {
    await openConfirmAndSwitch();

    const [, opts] = h.toastSuccessMock.mock.calls.at(-1)!;
    await act(async () => {
      await opts.action.onClick();
    });

    expect(h.setMessagesMock).toHaveBeenLastCalledWith([
      { role: 'user', content: 'oi' },
      { role: 'assistant', content: 'olá' },
    ]);
    expect(h.setChatContextMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ religion: 'buddhist' }),
    );

    act(() => {
      vi.advanceTimersByTime(15_000);
    });
    expect(h.clearAffiliationHistoryMock).not.toHaveBeenCalled();

    const undoneShown = h.toastSuccessMock.mock.calls.some(([msg]) =>
      String(msg).match(/desfeita/i),
    );
    expect(undoneShown).toBe(true);
  });
});
