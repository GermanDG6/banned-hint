import { describe, it, expect } from 'vitest';
import { Word } from './word.value-object';
import { EmptyWordException } from '../exceptions/empty-word.exception';

describe('Word', () => {
  describe('create', () => {
    it('should create a Word with a valid non-empty string', () => {
      const word = Word.create('apple');
      expect(word.value).toBe('apple');
    });

    it('should trim whitespace from word value', () => {
      const word = Word.create('  apple  ');
      expect(word.value).toBe('apple');
    });

    it('should throw EmptyWordException when word is empty', () => {
      expect(() => Word.create('')).toThrow(EmptyWordException);
    });

    it('should throw EmptyWordException when word is only whitespace', () => {
      expect(() => Word.create('   ')).toThrow(EmptyWordException);
    });
  });

  describe('equals', () => {
    it('should return true when comparing equal words', () => {
      const word1 = Word.create('apple');
      const word2 = Word.create('apple');
      expect(word1.equals(word2)).toBe(true);
    });

    it('should return false when comparing different words', () => {
      const word1 = Word.create('apple');
      const word2 = Word.create('banana');
      expect(word1.equals(word2)).toBe(false);
    });

    it('should be case-sensitive', () => {
      const word1 = Word.create('apple');
      const word2 = Word.create('Apple');
      expect(word1.equals(word2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the word value as string', () => {
      const word = Word.create('apple');
      expect(word.toString()).toBe('apple');
    });
  });
});
