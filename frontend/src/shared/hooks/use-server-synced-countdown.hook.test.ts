import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useServerSyncedCountdown } from './use-server-synced-countdown.hook';

describe('useServerSyncedCountdown', () => {
  const fixedNow = 1000000;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return correct initial remainingSeconds when startAt is now', () => {
    const { result } = renderHook(() =>
      useServerSyncedCountdown({ startAt: fixedNow, durationSeconds: 120 }),
    );
    expect(result.current.remainingSeconds).toBe(120);
  });

  it('should return formatted time as MM:SS', () => {
    const { result } = renderHook(() =>
      useServerSyncedCountdown({ startAt: fixedNow, durationSeconds: 90 }),
    );
    expect(result.current.formatted).toBe('01:30');
  });

  it('should decrement remainingSeconds every 500ms', () => {
    const { result } = renderHook(() =>
      useServerSyncedCountdown({ startAt: fixedNow, durationSeconds: 60 }),
    );

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Al avanzar 500ms, el timestamp avanza 500ms, así que remaining disminuye 0.5s
    expect(result.current.remainingSeconds).toBeLessThan(60);
    expect(result.current.remainingSeconds).toBeGreaterThan(59);
  });

  it('should floor the seconds in formatted output', () => {
    const { result } = renderHook(() =>
      useServerSyncedCountdown({ startAt: fixedNow, durationSeconds: 65 }),
    );

    // Avanzar 500ms → remaining ≈ 64.5s → formatted "01:04"
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.formatted).toBe('01:04');
  });

  it('should not go below 0', () => {
    const { result } = renderHook(() =>
      useServerSyncedCountdown({ startAt: fixedNow, durationSeconds: 2 }),
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.remainingSeconds).toBe(0);
  });

  it('should call onExpire exactly once when reaching 0', () => {
    const onExpire = vi.fn();
    renderHook(() => useServerSyncedCountdown({ startAt: fixedNow, durationSeconds: 1, onExpire }));

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('should not call onExpire again if time stays at 0', () => {
    const onExpire = vi.fn();
    renderHook(() => useServerSyncedCountdown({ startAt: fixedNow, durationSeconds: 1, onExpire }));

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(onExpire).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('should reset and restart when startAt changes', () => {
    const onExpire = vi.fn();
    const { rerender } = renderHook((props) => useServerSyncedCountdown(props), {
      initialProps: {
        startAt: fixedNow,
        durationSeconds: 60,
        onExpire,
      },
    });

    // Avanzar 3 segundos
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Nueva ronda con nuevo startAt
    const newStartAt = fixedNow + 3000;
    vi.setSystemTime(newStartAt);

    rerender({
      startAt: newStartAt,
      durationSeconds: 60,
      onExpire,
    });

    // Después del cambio, remaining debe estar cercano a 60 nuevamente
    const hookAfterRerender = renderHook(() =>
      useServerSyncedCountdown({ startAt: newStartAt, durationSeconds: 60 }),
    );
    expect(hookAfterRerender.result.current.remainingSeconds).toBeCloseTo(60, 1);
  });

  it('should format 0 seconds as 00:00', () => {
    const { result } = renderHook(() =>
      useServerSyncedCountdown({ startAt: fixedNow, durationSeconds: 1 }),
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.formatted).toBe('00:00');
  });

  it('should update formatted when remainingSeconds changes', () => {
    const { result } = renderHook(() =>
      useServerSyncedCountdown({ startAt: fixedNow, durationSeconds: 120 }),
    );

    expect(result.current.formatted).toBe('02:00');

    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(result.current.formatted).toBe('01:30');
  });
});
