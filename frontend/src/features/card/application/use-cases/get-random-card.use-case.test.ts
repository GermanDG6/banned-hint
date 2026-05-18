import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetRandomCard } from './get-random-card.use-case';
import { CardRepository } from '../../domain/repositories/card.repository';
import { Card } from '../../domain/entities/card.entity';
import { CardNotFoundException } from '../../domain/exceptions/card-not-found.exception';

describe('GetRandomCard', () => {
  let useCase: GetRandomCard;
  let findRandomMock: ReturnType<typeof vi.fn>;
  let cardRepositoryMock: CardRepository;

  beforeEach(() => {
    findRandomMock = vi.fn();
    cardRepositoryMock = {
      findRandom: findRandomMock,
    } as CardRepository;
    useCase = new GetRandomCard(cardRepositoryMock);
  });

  it('should return a Card when a card is found', async () => {
    const card = Card.create('apple', ['red', 'fruit'], 'test-id-1');
    findRandomMock.mockResolvedValue(card);

    const result = await useCase.execute();

    expect(result).toBe(card);
    expect(result.id.value).toBe('test-id-1');
    expect(result.word.value).toBe('apple');
  });

  it('should throw CardNotFoundException when no card is found', async () => {
    findRandomMock.mockResolvedValue(null);

    await expect(useCase.execute()).rejects.toThrow(CardNotFoundException);
  });

  it('should call cardRepository.findRandom exactly once', async () => {
    const card = Card.create('apple', ['red', 'fruit']);
    findRandomMock.mockResolvedValue(card);

    await useCase.execute();

    expect(findRandomMock).toHaveBeenCalledTimes(1);
  });
});
