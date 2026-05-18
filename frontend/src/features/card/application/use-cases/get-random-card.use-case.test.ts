import { describe, it, expect, vi } from 'vitest';
import { GetRandomCard } from './get-random-card.use-case';
import { FakeCardRepository } from '../../domain/testing/fake-card-repository';
import { CardMother } from '../../domain/testing/card.mother';
import { CardNotFoundException } from '../../domain/exceptions/card-not-found.exception';

describe('GetRandomCard', () => {
  it('should return a Card when a card is found', async () => {
    const card = CardMother.withIdAndWord('test-id-1', 'apple');
    const cardRepository = new FakeCardRepository(card);
    const useCase = new GetRandomCard(cardRepository);

    const result = await useCase.execute();

    expect(result).toBe(card);
    expect(result.id.value).toBe('test-id-1');
    expect(result.word.value).toBe('apple');
  });

  it('should throw CardNotFoundException when no card is found', async () => {
    const cardRepository = new FakeCardRepository(null);
    const useCase = new GetRandomCard(cardRepository);

    await expect(useCase.execute()).rejects.toThrow(CardNotFoundException);
  });

  it('should call cardRepository.findRandom exactly once', async () => {
    const card = CardMother.valid();
    const cardRepository = new FakeCardRepository(card);
    const useCase = new GetRandomCard(cardRepository);
    const spy = vi.spyOn(cardRepository, 'findRandom');

    await useCase.execute();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
