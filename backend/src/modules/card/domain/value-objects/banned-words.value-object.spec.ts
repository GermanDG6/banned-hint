import { BannedWords } from './banned-words.value-object';
import { EmptyBannedWordsException } from '../exceptions/empty-banned-words.exception';

describe('BannedWords', () => {
  describe('create', () => {
    it('should create BannedWords with valid non-empty list', () => {
      const words = BannedWords.create(['apple', 'banana']);

      expect(words.values).toEqual(['apple', 'banana']);
    });

    it('should trim whitespace from words', () => {
      const words = BannedWords.create(['  apple  ', '  banana  ']);

      expect(words.values).toEqual(['apple', 'banana']);
    });

    it('should filter out empty strings after trimming', () => {
      const words = BannedWords.create(['apple', '   ', 'banana']);

      expect(words.values).toEqual(['apple', 'banana']);
    });

    it('should throw EmptyBannedWordsException when list is empty', () => {
      expect(() => BannedWords.create([])).toThrow(EmptyBannedWordsException);
    });

    it('should throw EmptyBannedWordsException when all words are whitespace', () => {
      expect(() => BannedWords.create(['   ', '  '])).toThrow(EmptyBannedWordsException);
    });

    it('should freeze the values array to ensure immutability', () => {
      const words = BannedWords.create(['apple', 'banana']);

      expect(Object.isFrozen(words.values)).toBe(true);
    });
  });

  describe('contains', () => {
    it('should return true if word is in the banned list (case-insensitive)', () => {
      const words = BannedWords.create(['apple', 'banana']);

      expect(words.contains('APPLE')).toBe(true);
      expect(words.contains('Banana')).toBe(true);
      expect(words.contains('apple')).toBe(true);
    });

    it('should return true with whitespace around the word', () => {
      const words = BannedWords.create(['apple', 'banana']);

      expect(words.contains('  apple  ')).toBe(true);
    });

    it('should return false if word is not in the banned list', () => {
      const words = BannedWords.create(['apple', 'banana']);

      expect(words.contains('orange')).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true when comparing BannedWords with same values in same order', () => {
      const words1 = BannedWords.create(['apple', 'banana']);
      const words2 = BannedWords.create(['apple', 'banana']);

      expect(words1.equals(words2)).toBe(true);
    });

    it('should return true when comparing BannedWords with same values in different order', () => {
      const words1 = BannedWords.create(['apple', 'banana']);
      const words2 = BannedWords.create(['banana', 'apple']);

      expect(words1.equals(words2)).toBe(true);
    });

    it('should return false when comparing BannedWords with different values', () => {
      const words1 = BannedWords.create(['apple', 'banana']);
      const words2 = BannedWords.create(['apple', 'orange']);

      expect(words1.equals(words2)).toBe(false);
    });

    it('should return false when comparing BannedWords with different lengths', () => {
      const words1 = BannedWords.create(['apple', 'banana']);
      const words2 = BannedWords.create(['apple']);

      expect(words1.equals(words2)).toBe(false);
    });
  });

  describe('toArray', () => {
    it('should return a copy of the values array', () => {
      const words = BannedWords.create(['apple', 'banana']);
      const array = words.toArray();

      expect(array).toEqual(['apple', 'banana']);
      array[0] = 'orange';
      expect(words.values[0]).toBe('apple');
    });
  });
});
