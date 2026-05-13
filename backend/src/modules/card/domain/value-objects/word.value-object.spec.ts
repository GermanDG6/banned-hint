import { Word } from './word.value-object';
import { EmptyWordException } from '../exceptions/empty-word.exception';

describe('Word', () => {
  describe('create', () => {
    it('should create a Word with a valid non-empty value', () => {
      const word = Word.create('apple');

      expect(word.value).toBe('apple');
    });

    it('should trim whitespace from the value', () => {
      const word = Word.create('  hello  ');

      expect(word.value).toBe('hello');
    });

    it('should throw EmptyWordException when value is empty', () => {
      expect(() => Word.create('')).toThrow(EmptyWordException);
    });

    it('should throw EmptyWordException when value is only whitespace', () => {
      expect(() => Word.create('   ')).toThrow(EmptyWordException);
    });
  });

  describe('equals', () => {
    it('should return true when comparing Words with the same value', () => {
      const word1 = Word.create('apple');
      const word2 = Word.create('apple');

      expect(word1.equals(word2)).toBe(true);
    });

    it('should return false when comparing Words with different values', () => {
      const word1 = Word.create('apple');
      const word2 = Word.create('orange');

      expect(word1.equals(word2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the string value of the Word', () => {
      const word = Word.create('apple');

      expect(word.toString()).toBe('apple');
    });
  });
});
