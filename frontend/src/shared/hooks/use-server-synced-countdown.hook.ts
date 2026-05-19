import { useState, useEffect, useRef } from 'react';

interface UseServerSyncedCountdownOptions {
  startAt: number;
  durationSeconds: number;
  onExpire?: () => void;
}

export interface UseServerSyncedCountdownResult {
  remainingSeconds: number;
  formatted: string;
}

export function useServerSyncedCountdown({
  startAt,
  durationSeconds,
  onExpire,
}: UseServerSyncedCountdownOptions): UseServerSyncedCountdownResult {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() =>
    Math.max(0, durationSeconds - (Date.now() - startAt) / 1000),
  );

  const onExpireRef = useRef(onExpire);
  const expiredRef = useRef(false);

  // Actualizar la referencia de onExpire en cada render
  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  // Resetear el flag de expiración cuando cambia startAt o durationSeconds (nueva ronda)
  useEffect(() => {
    expiredRef.current = false;
  }, [startAt, durationSeconds]);

  // Intervalo principal que recalcula el tiempo restante cada 500ms
  useEffect(() => {
    const intervalId = setInterval(() => {
      const newRemaining = Math.max(0, durationSeconds - (Date.now() - startAt) / 1000);
      setRemainingSeconds(newRemaining);

      // Llamar a onExpire exactamente una vez cuando llega a 0
      if (newRemaining === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current?.();
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, [startAt, durationSeconds]);

  const minutes = Math.floor(remainingSeconds / 60);
  const secs = Math.floor(remainingSeconds % 60);
  const formatted = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return { remainingSeconds, formatted };
}
