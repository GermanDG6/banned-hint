import { useState, useCallback, useEffect } from 'react';
import { Card } from '../../domain/entities/card.entity';
import { useGetRandomCard } from '../../infrastructure/card-dependencies.context';

export interface UseRandomCardResult {
  card: Card | null;
  loading: boolean;
  error: Error | null;
  reload: () => void;
}

export function useRandomCard(): UseRandomCardResult {
  const getRandomCard = useGetRandomCard();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRandomCard.execute();
      setCard(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [getRandomCard]);

  useEffect(() => {
    void load();
  }, [load]);

  return { card, loading, error, reload: load };
}
