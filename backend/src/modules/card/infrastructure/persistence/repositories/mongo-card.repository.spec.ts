import { MongoCardRepository } from './mongo-card.repository';
import { Card } from '../../../domain/entities/card.entity';

describe('MongoCardRepository', () => {
  let repository: MongoCardRepository;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockCardModel: any; //TODO remove any is possible?

  beforeEach(() => {
    mockCardModel = {
      aggregate: jest.fn(),
    };

    repository = new MongoCardRepository(mockCardModel);
  });

  describe('findRandom', () => {
    it('should return a Card when a document is found', async () => {
      const mockCard = Card.create('apple', ['red', 'fruit', 'tree', 'sweet']);
      const mockDoc = {
        _id: mockCard.id.value,
        word: mockCard.word.value,
        bannedWords: mockCard.bannedWords.toArray(),
      };

      mockCardModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockDoc]),
      });

      const result = await repository.findRandom();

      expect(result).toBeDefined();
      expect(result?.id.value).toBe(mockCard.id.value);
      expect(result?.word.value).toBe(mockCard.word.value);
      expect(result?.bannedWords.toArray()).toEqual(mockCard.bannedWords.toArray());
    });

    it('should return null when no documents are found', async () => {
      mockCardModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await repository.findRandom();

      expect(result).toBeNull();
    });

    it('should call aggregate with $sample stage', async () => {
      mockCardModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      await repository.findRandom();

      expect(mockCardModel.aggregate).toHaveBeenCalledWith([{ $sample: { size: 1 } }]);
    });
  });
});
