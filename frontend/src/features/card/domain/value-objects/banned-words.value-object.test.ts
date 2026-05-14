import { describe, it, expect } from 'vitest';
import { BannedWords } from './banned-words.value-object';
import { EmptyBannedWordsException } from '../exceptions/empty-banned-words.exception';

describe('BannedWords', () => {
  describe('create', () => {
    it('should create BannedWords with a non-empty list of words', () => {
      const bannedWords = BannedWords.create(['red', 'fruit']);
      expect(bannedWords.values).toEqual(['red', 'fruit']);
    });

    it('should trim whitespace from each word', () => {
      const bannedWords = BannedWords.create(['  red  ', '  fruit  ']);
      expect(bannedWords.values).toEqual(['red', 'fruit']);
    });

    it('should filter out empty strings after trimming', () => {
      const bannedWords = BannedWords.create(['red', '  ', 'fruit', '']);
      expect(bannedWords.values).toEqual(['red', 'fruit']);
    });

    it('should throw EmptyBannedWordsException when list is empty', () => {
      expect(() => BannedWords.create([])).toThrow(EmptyBannedWordsException);
    });

    it('should throw EmptyBannedWordsException when all words are empty after trimming', () => {
      expect(() => BannedWords.create(['  ', '', '  '])).toThrow(EmptyBannedWordsException);
    });

    it('should freeze the values array to prevent mutation', () => {
      const bannedWords = BannedWords.create(['red', 'fruit']);
      expect(Object.isFrozen(bannedWords.values)).toBe(true);
    });
  });

  describe('contains', () => {
    it('should return true when word is in the list', () => {
      const bannedWords = BannedWords.create(['red', 'fruit']);
      expect(bannedWords.contains('red')).toBe(true);
    });

    it('should return false when word is not in the list', () => {
      const bannedWords = BannedWords.create(['red', 'fruit']);
      expect(bannedWords.contains('green')).toBe(false);
    });

    it('should be case-insensitive', () => {
      const bannedWords = BannedWords.create(['red', 'fruit']);
      expect(bannedWords.contains('RED')).toBe(true);
      expect(bannedWords.contains('Fruit')).toBe(true);
    });

    it('should trim the word before checking', () => {
      const bannedWords = BannedWords.create(['red', 'fruit']);
      expect(bannedWords.contains('  red  ')).toBe(true);
    });
  });

  describe('equals', () => {
    it('should return true when lists contain the same words', () => {
      const bannedWords1 = BannedWords.create(['red', 'fruit']);
      const bannedWords2 = BannedWords.create(['red', 'fruit']);
      expect(bannedWords1.equals(bannedWords2)).toBe(true);
    });

    it('should return true when lists contain same words in different order', () => {
      const bannedWords1 = BannedWords.create(['red', 'fruit']);
      const bannedWords2 = BannedWords.create(['fruit', 'red']);
      expect(bannedWords1.equals(bannedWords2)).toBe(true);
    });

    it('should return false when lists have different lengths', () => {
      const bannedWords1 = BannedWords.create(['red', 'fruit']);
      const bannedWords2 = BannedWords.create(['red', 'fruit', 'green']);
      expect(bannedWords1.equals(bannedWords2)).toBe(false);
    });

    it('should return false when lists contain different words', () => {
      const bannedWords1 = BannedWords.create(['red', 'fruit']);
      const bannedWords2 = BannedWords.create(['red', 'green']);
      expect(bannedWords1.equals(bannedWords2)).toBe(false);
    });
  });

  describe('toArray', () => {
    it('should return array copy of values', () => {
      const bannedWords = BannedWords.create(['red', 'fruit']);
      const array = bannedWords.toArray();
      expect(array).toEqual(['red', 'fruit']);
    });

    it('should return a new array instance on each call', () => {
      const bannedWords = BannedWords.create(['red', 'fruit']);
      const array1 = bannedWords.toArray();
      const array2 = bannedWords.toArray();
      expect(array1).not.toBe(array2);
    });
  });
});
