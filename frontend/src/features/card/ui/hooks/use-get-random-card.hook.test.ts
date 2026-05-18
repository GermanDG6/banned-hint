import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRandomCard } from './use-get-random-card.hook';
import { CardMother } from '../../domain/testing/card.mother';
import { GetRandomCard } from '../../application/use-cases/get-random-card.use-case';

vi.mock('../../infrastructure/card-dependencies.context', () => ({
  useGetRandomCard: vi.fn(),
}));

import { useGetRandomCard } from '../../infrastructure/card-dependencies.context';

describe('useRandomCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should start with loading=true and card=null', async () => {
    const card = CardMother.valid();
    const mockUseCase = { execute: vi.fn().mockResolvedValue(card) };
    vi.mocked(useGetRandomCard).mockReturnValue(mockUseCase as unknown as GetRandomCard);

    const { result } = renderHook(() => useRandomCard());

    expect(result.current.loading).toBe(true);
    expect(result.current.card).toBeNull();
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('should set card on successful load', async () => {
    const card = CardMother.valid();
    const mockUseCase = { execute: vi.fn().mockResolvedValue(card) };
    vi.mocked(useGetRandomCard).mockReturnValue(mockUseCase as unknown as GetRandomCard);

    const { result } = renderHook(() => useRandomCard());

    await waitFor(() => expect(result.current.card).toBe(card));
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should set error when load fails', async () => {
    const error = new Error('Network error');
    const mockUseCase = { execute: vi.fn().mockRejectedValue(error) };
    vi.mocked(useGetRandomCard).mockReturnValue(mockUseCase as unknown as GetRandomCard);

    const { result } = renderHook(() => useRandomCard());

    await waitFor(() => expect(result.current.error).toBe(error));
    expect(result.current.card).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should reload and update card on reload call', async () => {
    const card1 = CardMother.valid();
    const card2 = CardMother.withWord('banana');
    const mockUseCase = {
      execute: vi.fn().mockResolvedValueOnce(card1).mockResolvedValueOnce(card2),
    };
    vi.mocked(useGetRandomCard).mockReturnValue(mockUseCase as unknown as GetRandomCard);

    const { result } = renderHook(() => useRandomCard());
    await waitFor(() => expect(result.current.card).toBe(card1));

    act(() => {
      result.current.reload();
    });
    await waitFor(() => expect(result.current.card).toBe(card2));
  });
});
