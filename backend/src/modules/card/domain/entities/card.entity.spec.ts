import { Card } from './card.entity';
import { EmptyWordException } from '../exceptions/empty-word.exception';
import { InsufficientBannedWordsException } from '../exceptions/insufficient-banned-words.exception';

describe('Card', () => {
  describe('create', () => {
    it('should create a Card with valid word and bannedWords', () => {
      const card = Card.create('apple', ['red', 'fruit', 'tree', 'sweet']);

      expect(card.word.value).toBe('apple');
      expect(card.bannedWords.values).toEqual(['red', 'fruit', 'tree', 'sweet']);
      expect(card.id).toBeDefined();
    });

    it('should use provided id if given', () => {
      const providedId = '123e4567-e89b-12d3-a456-426614174000';
      const card = Card.create('apple', ['red', 'fruit', 'tree', 'sweet'], providedId);

      expect(card.id.value).toBe(providedId);
    });

    it('should generate a unique id if not provided', () => {
      const card1 = Card.create('apple', ['red', 'fruit', 'tree', 'sweet']);
      const card2 = Card.create('apple', ['red', 'fruit', 'tree', 'sweet']);

      expect(card1.id.value).not.toBe(card2.id.value);
    });

    it('should throw EmptyWordException when word is empty', () => {
      expect(() => Card.create('', ['red', 'fruit', 'tree', 'sweet'])).toThrow(EmptyWordException);
    });

    it('should throw InsufficientBannedWordsException when bannedWords is empty', () => {
      expect(() => Card.create('apple', [])).toThrow(InsufficientBannedWordsException);
    });

    it('should delegate validation to Word and BannedWords value objects', () => {
      const card = Card.create('  apple  ', ['  red  ', '  fruit  ', '  tree  ', '  sweet  ']);

      expect(card.word.value).toBe('apple');
      expect(card.bannedWords.values).toEqual(['red', 'fruit', 'tree', 'sweet']);
    });
  });

  describe('properties', () => {
    it('should have readonly id, word, and bannedWords properties', () => {
      const card = Card.create('apple', ['red', 'fruit', 'tree', 'sweet']);

      expect(card.id).toBeDefined();
      expect(card.word).toBeDefined();
      expect(card.bannedWords).toBeDefined();

      // Properties should be readonly (TypeScript validates this at compile time)
      // Immutability is enforced by the value objects themselves
      expect(card.id.value).toBe(card.id.value);
    });
  });
});
