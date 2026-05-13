import { FakeCardRepository } from './fake-card.repository';

describe('FakeCardRepository', () => {
  let repository: FakeCardRepository;

  beforeEach(() => {
    repository = new FakeCardRepository();
  });

  describe('findRandom', () => {
    it('should return a Card from the predefined list', async () => {
      const result = await repository.findRandom();

      expect(result).toBeDefined();
      expect(result!.word.value).toBeDefined();
      expect(result!.bannedWords.values.length).toBeGreaterThan(0);
    });

    it('should return a valid Card with id, word, and bannedWords', async () => {
      const result = await repository.findRandom();

      expect(result).toBeDefined();
      expect(result!.id).toBeDefined();
      expect(result!.word.value).toBeTruthy();
      expect(result!.bannedWords.values.length).toBeGreaterThan(0);
    });

    it('should return different cards across multiple calls', async () => {
      const results = await Promise.all([
        repository.findRandom(),
        repository.findRandom(),
        repository.findRandom(),
        repository.findRandom(),
        repository.findRandom(),
      ]);

      const uniqueWords = new Set(results.map((r) => r?.word.value));
      // With 5 cards and 5 random picks, it's highly likely to get at least 2 different words
      expect(uniqueWords.size).toBeGreaterThan(1);
    });
  });
});
