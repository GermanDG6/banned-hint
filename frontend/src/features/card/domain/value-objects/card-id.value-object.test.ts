import { describe, it, expect } from 'vitest';
import { CardId } from './card-id.value-object';

describe('CardId', () => {
  describe('generate', () => {
    it('should generate a valid UUID', () => {
      const cardId = CardId.generate();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(cardId.value).toMatch(uuidRegex);
    });

    it('should generate unique IDs on each call', () => {
      const cardId1 = CardId.generate();
      const cardId2 = CardId.generate();
      expect(cardId1.value).not.toBe(cardId2.value);
    });
  });

  describe('from', () => {
    it('should create a CardId from a provided string', () => {
      const providedId = '123e4567-e89b-12d3-a456-426614174000';
      const cardId = CardId.from(providedId);
      expect(cardId.value).toBe(providedId);
    });
  });

  describe('equals', () => {
    it('should return true when comparing equal IDs', () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const cardId1 = CardId.from(id);
      const cardId2 = CardId.from(id);
      expect(cardId1.equals(cardId2)).toBe(true);
    });

    it('should return false when comparing different IDs', () => {
      const cardId1 = CardId.from('123e4567-e89b-12d3-a456-426614174000');
      const cardId2 = CardId.from('223e4567-e89b-12d3-a456-426614174000');
      expect(cardId1.equals(cardId2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the ID value as string', () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const cardId = CardId.from(id);
      expect(cardId.toString()).toBe(id);
    });
  });
});
