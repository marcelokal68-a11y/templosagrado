import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTraditionSwitchNotice } from '../useTraditionSwitchNotice';

describe('useTraditionSwitchNotice (integration: 8s tradition banner)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('does not show a notice on the first selection', () => {
    const { result } = renderHook(({ r, p }) => useTraditionSwitchNotice(r, p), {
      initialProps: { r: '', p: '' },
    });
    expect(result.current.notice).toBeNull();
    // first time a tradition is picked → no banner
    act(() => {}); // ensure effect committed
  });

  it('shows {from,to} when tradition changes and clears it after 8s', () => {
    const { result, rerender } = renderHook(
      ({ r, p }) => useTraditionSwitchNotice(r, p),
      { initialProps: { r: 'buddhist', p: '' } },
    );
    // seed the previous value
    expect(result.current.notice).toBeNull();

    rerender({ r: 'jewish', p: '' });
    expect(result.current.notice).toEqual({ from: 'buddhist', to: 'jewish' });

    // still visible just before 8s
    act(() => {
      vi.advanceTimersByTime(7999);
    });
    expect(result.current.notice).toEqual({ from: 'buddhist', to: 'jewish' });

    // disappears exactly at 8s
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.notice).toBeNull();
  });

  it('can be dismissed manually before the 8s window expires', () => {
    const { result, rerender } = renderHook(
      ({ r, p }) => useTraditionSwitchNotice(r, p),
      { initialProps: { r: 'buddhist', p: '' } },
    );
    rerender({ r: 'jewish', p: '' });
    expect(result.current.notice).not.toBeNull();

    act(() => result.current.dismiss());
    expect(result.current.notice).toBeNull();
  });

  it('does not fire when switching from empty to a value (first pick)', () => {
    const { result, rerender } = renderHook(
      ({ r, p }) => useTraditionSwitchNotice(r, p),
      { initialProps: { r: '', p: '' } },
    );
    rerender({ r: 'buddhist', p: '' });
    expect(result.current.notice).toBeNull();
  });
});
