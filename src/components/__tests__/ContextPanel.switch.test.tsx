import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// ---------- Mocks ----------
const clearAffiliationHistoryMock = vi.fn().mockResolvedValue(undefined);
vi.mock('@/lib/clearAffiliationHistory', () => ({
  clearAffiliationHistory: clearAffiliationHistoryMock,
}));

const toastSuccessMock = vi.fn();
const toastMock = vi.fn();
vi.mock('sonner', () => {
  const fn: any = (...args: any[]) => toastMock(...args);
  fn.success = toastSuccessMock;
  fn.error = vi.fn();
  return { toast: fn };
});

// Chainable supabase mock — every from().update().eq() resolves OK.
const supabaseUpdates: any[] = [];
vi.mock('@/integrations/supabase/client', () => {
  const builder = () => {
    const b: any = {
      update: (payload: any) => {
        supabaseUpdates.push(payload);
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

// AppContext — controllable state
type Ctx = {
  religion: string;
  need: string;
  mood: string;
  topic: string;
  philosophy: string;
};

let messagesState: { role: string; content: string }[] = [];
let chatContextState: Ctx = {
  religion: 'buddhist',
  need: '',
  mood: '',
  topic: '',
  philosophy: '',
};
const setMessagesMock = vi.fn((next: any) => {
  messagesState = typeof next === 'function' ? next(messagesState) : next;
});
const setChatContextMock = vi.fn((next: any) => {
  chatContextState = typeof next === 'function' ? next(chatContextState) : next;
});
const refreshProfileMock = vi.fn().mockResolvedValue(undefined);

vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({
    language: 'pt-BR',
    chatContext: chatContextState,
    setChatContext: setChatContextMock,
    messages: messagesState,
    setMessages: setMessagesMock,
    preferredReligion: 'buddhist',
    user: { id: 'user-test-1' },
    refreshProfile: refreshProfileMock,
  }),
}));

// Import AFTER mocks
import ContextPanel from '@/components/ContextPanel';

function resetAll() {
  messagesState = [
    { role: 'user', content: 'oi' },
    { role: 'assistant', content: 'olá' },
  ];
  chatContextState = {
    religion: 'buddhist',
    need: '',
    mood: '',
    topic: '',
    philosophy: '',
  };
  clearAffiliationHistoryMock.mockClear();
  toastSuccessMock.mockClear();
  toastMock.mockClear();
  setMessagesMock.mockClear();
  setChatContextMock.mockClear();
  refreshProfileMock.mockClear();
  supabaseUpdates.length = 0;
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
    expect(
      screen.getByText(/desfazer por 15 segundos/i),
    ).toBeInTheDocument();

    // Confirm the switch
    await user.click(
      screen.getByRole('button', { name: /Sim, trocar e limpar chat/i }),
    );

    return user;
  }

  it('clears the chat immediately, updates preferred_religion and shows undo toast', async () => {
    await openConfirmAndSwitch();

    // Chat was cleared synchronously
    expect(setMessagesMock).toHaveBeenCalledWith([]);
    expect(messagesState).toEqual([]);

    // preferred_religion in DB updated to the new key
    expect(supabaseUpdates.some(u => u.preferred_religion === 'jewish')).toBe(
      true,
    );
    expect(refreshProfileMock).toHaveBeenCalled();

    // Toast with action (Desfazer) was shown with 15s duration
    expect(toastSuccessMock).toHaveBeenCalled();
    const [, opts] = toastSuccessMock.mock.calls.at(-1)!;
    expect(opts.duration).toBe(15000);
    expect(opts.action.label).toMatch(/Desfazer/i);

    // Hard deletion has NOT happened yet
    expect(clearAffiliationHistoryMock).not.toHaveBeenCalled();
  });

  it('deletes affiliation history exactly after the 15s undo window', async () => {
    await openConfirmAndSwitch();

    // 14.999s → still pending
    act(() => {
      vi.advanceTimersByTime(14_999);
    });
    expect(clearAffiliationHistoryMock).not.toHaveBeenCalled();

    // 15.000s → fires
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(clearAffiliationHistoryMock).toHaveBeenCalledTimes(1);
    expect(clearAffiliationHistoryMock).toHaveBeenCalledWith(
      'user-test-1',
      'buddhist', // prevReligion
      '', // prevPhilosophy
    );
  });

  it('undo button cancels deletion and restores previous chat/context', async () => {
    await openConfirmAndSwitch();

    const [, opts] = toastSuccessMock.mock.calls.at(-1)!;
    // Pretend the user clicks the toast action within the 15s window
    await act(async () => {
      await opts.action.onClick();
    });

    // Restored prior messages + context
    expect(setMessagesMock).toHaveBeenLastCalledWith([
      { role: 'user', content: 'oi' },
      { role: 'assistant', content: 'olá' },
    ]);
    expect(setChatContextMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ religion: 'buddhist' }),
    );

    // Even after the 15s window passes, deletion must NOT happen
    act(() => {
      vi.advanceTimersByTime(15_000);
    });
    expect(clearAffiliationHistoryMock).not.toHaveBeenCalled();

    // A confirmation toast ("Troca desfeita") was shown
    const undoneShown = toastSuccessMock.mock.calls.some(([msg]) =>
      String(msg).match(/desfeita/i),
    );
    expect(undoneShown).toBe(true);
  });
});
