/**
 * End-to-end-style tests for the shared `BackToChatFab`:
 *
 *   1. When the page is already at the bottom, clicking the FAB navigates
 *      immediately (no wasted scroll animation).
 *   2. When there is hidden content below the fold, the FAB first triggers
 *      a *smooth* scroll to the very bottom and only navigates afterwards
 *      — guaranteeing the user can see whatever was previously covered.
 *   3. The shared `FAB_SAFE_PADDING` reserved by every FAB page is large
 *      enough to clear the FAB's own footprint (button height + bottom
 *      offset on both mobile and desktop), so no content stays hidden
 *      under the floating button.
 *
 * These tests render the real component through React Router with a
 * mocked AppContext (user logged-in) and stub `window.scrollTo` so we
 * can observe the call ordering deterministically with fake timers.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import React from 'react';

// Hoisted mock for AppContext (a logged-in user is required)
const h = vi.hoisted(() => ({
  user: { id: 'user-1' } as any,
}));
vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({ user: h.user, language: 'pt-BR' }),
}));

import BackToChatFab from '@/components/BackToChatFab';
import { FAB_SAFE_PADDING } from '@/components/fab/fabConfig';

// Tracks every route the user lands on, so we can assert navigation order.
function LocationRecorder({ trail }: { trail: string[] }) {
  const loc = useLocation();
  React.useEffect(() => {
    trail.push(loc.pathname);
  }, [loc.pathname, trail]);
  return null;
}

function renderAt(path: string, trail: string[]) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LocationRecorder trail={trail} />
      <Routes>
        <Route path="/" element={<div data-testid="chat-home">Chat</div>} />
        <Route path="*" element={<div data-testid="other-page">Other</div>} />
      </Routes>
      <BackToChatFab />
    </MemoryRouter>,
  );
}

describe('BackToChatFab — E2E click → scroll → navigate', () => {
  let scrollSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    scrollSpy = vi
      .spyOn(window, 'scrollTo')
      // Simulate the browser completing the smooth scroll instantly so
      // any later read of `scrollY` reflects "we're at the bottom".
      .mockImplementation(((opts: any) => {
        const top =
          typeof opts === 'number' ? opts : (opts && opts.top) ?? 0;
        Object.defineProperty(window, 'scrollY', {
          configurable: true,
          value: top,
        });
      }) as any);
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    scrollSpy.mockRestore();
    cleanup();
  });

  function setScrollContext({
    scrollHeight,
    innerHeight,
    scrollY,
  }: {
    scrollHeight: number;
    innerHeight: number;
    scrollY: number;
  }) {
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: scrollHeight,
    });
    Object.defineProperty(document.body, 'scrollHeight', {
      configurable: true,
      value: scrollHeight,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: innerHeight,
    });
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: scrollY,
    });
  }

  it('navigates immediately when the page is already at the bottom', () => {
    const trail: string[] = [];
    setScrollContext({ scrollHeight: 800, innerHeight: 800, scrollY: 0 });
    renderAt('/verse', trail);

    fireEvent.click(screen.getByRole('button', { name: /chat/i }));

    // No smooth scroll required, navigation happens immediately
    expect(scrollSpy).not.toHaveBeenCalled();
    expect(trail.at(-1)).toBe('/');
    expect(screen.getByTestId('chat-home')).toBeInTheDocument();
  });

  it('smooth-scrolls to the very bottom BEFORE navigating when content is hidden', () => {
    const trail: string[] = [];
    // Page is 3000px tall, viewport 800px, user is at the top → 2200px hidden
    setScrollContext({ scrollHeight: 3000, innerHeight: 800, scrollY: 0 });
    renderAt('/verse', trail);

    fireEvent.click(screen.getByRole('button', { name: /chat/i }));

    // 1) Scroll fired immediately, with smooth behavior, to the page bottom
    expect(scrollSpy).toHaveBeenCalledTimes(1);
    const [arg] = scrollSpy.mock.calls[0] as any;
    expect(arg).toMatchObject({ behavior: 'smooth', top: 2200 });

    // 2) Navigation NOT triggered yet — user can still see the page scrolling
    expect(trail.at(-1)).toBe('/verse');
    expect(screen.queryByTestId('chat-home')).toBeNull();

    // 3) After the scroll-completion delay (≤600ms), navigation happens
    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(trail.at(-1)).toBe('/');
    expect(screen.getByTestId('chat-home')).toBeInTheDocument();
  });

  it('does not render on routes that should not show the FAB', () => {
    const trail: string[] = [];
    renderAt('/some-other-route', trail);
    expect(screen.queryByRole('button', { name: /chat/i })).toBeNull();
  });

  it('does not render when there is no logged-in user', () => {
    const trail: string[] = [];
    const prev = h.user;
    h.user = null;
    try {
      renderAt('/verse', trail);
      expect(screen.queryByRole('button', { name: /chat/i })).toBeNull();
    } finally {
      h.user = prev;
    }
  });

  it('FAB_SAFE_PADDING leaves more room than the FAB occupies (mobile & desktop)', () => {
    // FAB layout (kept in sync with FAB_POSITION_CLASS):
    //   button height (h-12) = 48px
    //   bottom-20 mobile     = 80px
    //   bottom-6  desktop    = 24px
    const FAB_HEIGHT = 48;
    const MOBILE_BOTTOM = 80;
    const DESKTOP_BOTTOM = 24;

    // Tailwind spacing scale: each unit = 4px
    // FAB_SAFE_PADDING is expected to be "pb-40 md:pb-24"
    const mobilePb = 40 * 4; // 160px
    const desktopPb = 24 * 4; // 96px

    // Sanity-check the constant itself so a future edit can't silently
    // shrink the safe area without flagging this test.
    expect(FAB_SAFE_PADDING).toContain('pb-40');
    expect(FAB_SAFE_PADDING).toContain('md:pb-24');

    expect(mobilePb).toBeGreaterThan(FAB_HEIGHT + MOBILE_BOTTOM);
    expect(desktopPb).toBeGreaterThan(FAB_HEIGHT + DESKTOP_BOTTOM);
  });
});
