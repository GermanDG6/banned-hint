import { Test, TestingModule } from '@nestjs/testing';
import { CardController } from './card.controller';
import { GetRandomCardUseCase } from '../../../application/use-cases/get-random-card.use-case';
import { CardMother } from '../../../domain/testing/card.mother';

describe('CardController', () => {
  let controller: CardController;
  let useCase: GetRandomCardUseCase;

  beforeEach(async () => {
    const mockUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardController],
      providers: [
        {
          provide: GetRandomCardUseCase,
          useValue: mockUseCase,
        },
      ],
    }).compile();

    controller = module.get<CardController>(CardController);
    useCase = module.get<GetRandomCardUseCase>(GetRandomCardUseCase);
  });

  describe('getRandomCard', () => {
    it('should return a CardDto', async () => {
      const card = CardMother.valid();
      const cardDto = {
        id: card.id.value,
        word: card.word.value,
        bannedWords: card.bannedWords.toArray(),
      };

      jest.spyOn(useCase, 'execute').mockResolvedValue(cardDto);

      const result = await controller.getRandomCard();

      expect(result).toEqual(cardDto);
      expect(useCase.execute).toHaveBeenCalledTimes(1);
    });
  });
});
