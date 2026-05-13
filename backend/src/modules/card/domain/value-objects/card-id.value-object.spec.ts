import { CardId } from './card-id.value-object';

describe('CardId', () => {
  describe('generate', () => {
    it('should generate a unique CardId each time', () => {
      const cardId1 = CardId.generate();
      const cardId2 = CardId.generate();

      expect(cardId1.value).not.toBe(cardId2.value);
    });

    it('should generate a valid UUID string', () => {
      const cardId = CardId.generate();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(cardId.value).toMatch(uuidRegex);
    });
  });

  describe('from', () => {
    it('should create a CardId from an existing value', () => {
      const value = '123e4567-e89b-12d3-a456-426614174000';
      const cardId = CardId.from(value);

      expect(cardId.value).toBe(value);
    });
  });

  describe('equals', () => {
    it('should return true when comparing CardIds with the same value', () => {
      const value = '123e4567-e89b-12d3-a456-426614174000';
      const cardId1 = CardId.from(value);
      const cardId2 = CardId.from(value);

      expect(cardId1.equals(cardId2)).toBe(true);
    });

    it('should return false when comparing CardIds with different values', () => {
      const cardId1 = CardId.generate();
      const cardId2 = CardId.generate();

      expect(cardId1.equals(cardId2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the string value of the CardId', () => {
      const value = '123e4567-e89b-12d3-a456-426614174000';
      const cardId = CardId.from(value);

      expect(cardId.toString()).toBe(value);
    });
  });
});
