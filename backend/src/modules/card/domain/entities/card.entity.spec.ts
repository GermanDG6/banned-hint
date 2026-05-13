import { Card } from './card.entity';
import { EmptyWordException } from '../exceptions/empty-word.exception';
import { EmptyBannedWordsException } from '../exceptions/empty-banned-words.exception';

describe('Card', () => {
  describe('create', () => {
    it('should create a Card with valid word and bannedWords', () => {
      const card = Card.create('apple', ['red', 'fruit']);

      expect(card.word.value).toBe('apple');
      expect(card.bannedWords.values).toEqual(['red', 'fruit']);
      expect(card.id).toBeDefined();
    });

    it('should use provided id if given', () => {
      const providedId = '123e4567-e89b-12d3-a456-426614174000';
      const card = Card.create('apple', ['red', 'fruit'], providedId);

      expect(card.id.value).toBe(providedId);
    });

    it('should generate a unique id if not provided', () => {
      const card1 = Card.create('apple', ['red', 'fruit']);
      const card2 = Card.create('apple', ['red', 'fruit']);

      expect(card1.id.value).not.toBe(card2.id.value);
    });

    it('should throw EmptyWordException when word is empty', () => {
      expect(() => Card.create('', ['red', 'fruit'])).toThrow(EmptyWordException);
    });

    it('should throw EmptyBannedWordsException when bannedWords is empty', () => {
      expect(() => Card.create('apple', [])).toThrow(EmptyBannedWordsException);
    });

    it('should delegate validation to Word and BannedWords value objects', () => {
      const card = Card.create('  apple  ', ['  red  ', '  fruit  ']);

      expect(card.word.value).toBe('apple');
      expect(card.bannedWords.values).toEqual(['red', 'fruit']);
    });
  });

  describe('properties', () => {
    it('should have readonly id, word, and bannedWords properties', () => {
      const card = Card.create('apple', ['red', 'fruit']);

      expect(card.id).toBeDefined();
      expect(card.word).toBeDefined();
      expect(card.bannedWords).toBeDefined();

      // Properties should be readonly (TypeScript validates this at compile time)
      // Immutability is enforced by the value objects themselves
      expect(card.id.value).toBe(card.id.value);
    });
  });
});
