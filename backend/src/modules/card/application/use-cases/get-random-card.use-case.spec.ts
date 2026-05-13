import { GetRandomCardUseCase } from './get-random-card.use-case';
import { CardRepository } from '../../domain/repositories/card.repository';
import { CardMother } from '../../domain/testing/card.mother';
import { CardNotFoundException } from '../../domain/exceptions/card-not-found.exception';

describe('GetRandomCardUseCase', () => {
  let useCase: GetRandomCardUseCase;
  let cardRepositoryMock: jest.Mocked<CardRepository>;

  beforeEach(() => {
    cardRepositoryMock = {
      findRandom: jest.fn(),
    };
    useCase = new GetRandomCardUseCase(cardRepositoryMock);
  });

  it('should return a CardDto when a card is found', async () => {
    const card = CardMother.valid();
    cardRepositoryMock.findRandom.mockResolvedValue(card);

    const result = await useCase.execute();

    expect(result.id).toBe(card.id.value);
    expect(result.word).toBe(card.word.value);
    expect(result.bannedWords).toEqual(card.bannedWords.toArray());
  });

  it('should throw CardNotFoundException when no card is found', async () => {
    cardRepositoryMock.findRandom.mockResolvedValue(null);

    await expect(useCase.execute()).rejects.toThrow(CardNotFoundException);
  });

  it('should call cardRepository.findRandom exactly once', async () => {
    const card = CardMother.valid();
    cardRepositoryMock.findRandom.mockResolvedValue(card);

    await useCase.execute();

    expect(cardRepositoryMock.findRandom).toHaveBeenCalledTimes(1);
  });
});
