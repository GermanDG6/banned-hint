import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useCountdown } from './use-countdown.hook';

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start with initialSeconds and isRunning=true', () => {
    const { result } = renderHook(() => useCountdown({ initialSeconds: 90 }));
    expect(result.current.remainingSeconds).toBe(90);
    expect(result.current.formatted).toBe('01:30');
    expect(result.current.isRunning).toBe(true);
  });

  it('should decrement remainingSeconds every second when running', () => {
    const { result } = renderHook(() => useCountdown({ initialSeconds: 10 }));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.remainingSeconds).toBe(7);
  });

  it('should stop decrementing when paused', () => {
    const { result } = renderHook(() => useCountdown({ initialSeconds: 10 }));
    act(() => {
      result.current.pause();
    });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.remainingSeconds).toBe(10);
    expect(result.current.isRunning).toBe(false);
  });

  it('should resume decrementing after pause', () => {
    const { result } = renderHook(() => useCountdown({ initialSeconds: 10 }));
    act(() => {
      result.current.pause();
    });
    act(() => {
      result.current.resume();
    });
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.remainingSeconds).toBe(7);
    expect(result.current.isRunning).toBe(true);
  });

  it('should reset to initialSeconds and restart', () => {
    const { result } = renderHook(() => useCountdown({ initialSeconds: 10 }));
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.remainingSeconds).toBe(10);
    expect(result.current.isRunning).toBe(true);
  });

  it('should not go below 0', () => {
    const { result } = renderHook(() => useCountdown({ initialSeconds: 2 }));
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(result.current.remainingSeconds).toBe(0);
  });

  it('should call onExpire once when reaching 0', () => {
    const onExpire = vi.fn();
    renderHook(() => useCountdown({ initialSeconds: 3, onExpire }));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('should set isRunning=false when expired', () => {
    const { result } = renderHook(() => useCountdown({ initialSeconds: 2 }));
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.isRunning).toBe(false);
  });

  it('should allow calling onExpire again after reset', () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() => useCountdown({ initialSeconds: 2, onExpire }));
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onExpire).toHaveBeenCalledTimes(1);
    act(() => {
      result.current.reset();
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onExpire).toHaveBeenCalledTimes(2);
  });
});
