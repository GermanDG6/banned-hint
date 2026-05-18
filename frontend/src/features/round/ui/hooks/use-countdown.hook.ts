import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCountdownOptions {
  initialSeconds: number;
  onExpire?: () => void;
}

export interface UseCountdownResult {
  remainingSeconds: number;
  formatted: string;
  isRunning: boolean;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export function useCountdown({
  initialSeconds,
  onExpire,
}: UseCountdownOptions): UseCountdownResult {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const onExpireRef = useRef(onExpire);
  const expiredRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning]);

  useEffect(() => {
    if (remainingSeconds === 0 && !expiredRef.current && initialSeconds > 0) {
      expiredRef.current = true;
      setIsRunning(false);
      onExpireRef.current?.();
    }
  }, [remainingSeconds, initialSeconds]);

  const pause = useCallback(() => setIsRunning(false), []);

  const resume = useCallback(() => {
    if (remainingSeconds > 0) setIsRunning(true);
  }, [remainingSeconds]);

  const reset = useCallback(() => {
    expiredRef.current = false;
    setRemainingSeconds(initialSeconds);
    setIsRunning(true);
  }, [initialSeconds]);

  const minutes = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return { remainingSeconds, formatted, isRunning, pause, resume, reset };
}
