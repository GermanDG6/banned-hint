import { describe, it, expect } from 'vitest';
import { PlayerId } from './player-id.value-object';
import { InvalidPlayerIdException } from '../exceptions/invalid-player-id.exception';

describe('PlayerId', () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

  it('should create a valid PlayerId with a valid UUID', () => {
    const playerId = PlayerId.create(validUUID);
    expect(playerId.value()).toBe(validUUID.toLowerCase());
  });

  it('should normalize UUID to lowercase', () => {
    const uppercaseUUID = '550E8400-E29B-41D4-A716-446655440000';
    const playerId = PlayerId.create(uppercaseUUID);
    expect(playerId.value()).toBe(validUUID.toLowerCase());
  });

  it('should trim whitespace from UUID', () => {
    const playerId = PlayerId.create(`  ${validUUID}  `);
    expect(playerId.value()).toBe(validUUID.toLowerCase());
  });

  it('should throw InvalidPlayerIdException when UUID is empty', () => {
    expect(() => PlayerId.create('')).toThrow(InvalidPlayerIdException);
  });

  it('should throw InvalidPlayerIdException when UUID is only whitespace', () => {
    expect(() => PlayerId.create('   ')).toThrow(InvalidPlayerIdException);
  });

  it('should throw InvalidPlayerIdException when value is not a valid UUID', () => {
    expect(() => PlayerId.create('not-a-uuid')).toThrow(InvalidPlayerIdException);
  });

  it('should throw InvalidPlayerIdException when value is a valid string but not UUID format', () => {
    expect(() => PlayerId.create('player-1')).toThrow(InvalidPlayerIdException);
  });

  it('should throw InvalidPlayerIdException when value has incorrect UUID structure', () => {
    expect(() => PlayerId.create('550e8400-e29b-41d4-a716')).toThrow(InvalidPlayerIdException);
  });

  it('should throw InvalidPlayerIdException when value has non-hex characters', () => {
    expect(() => PlayerId.create('550e8400-e29b-41d4-a716-44665544000g')).toThrow(
      InvalidPlayerIdException,
    );
  });

  it('should compare two PlayerId instances for equality', () => {
    const playerId1 = PlayerId.create(validUUID);
    const playerId2 = PlayerId.create(validUUID.toUpperCase());
    const playerId3 = PlayerId.create('550e8400-e29b-41d4-a716-446655440001');

    expect(playerId1.equals(playerId2)).toBe(true);
    expect(playerId1.equals(playerId3)).toBe(false);
  });

  it('should convert to string correctly', () => {
    const playerId = PlayerId.create(validUUID);
    expect(playerId.toString()).toBe(validUUID.toLowerCase());
  });

  describe('generate', () => {
    it('should generate a PlayerId with valid UUID format', () => {
      const playerId = PlayerId.generate();
      expect(uuidRegex.test(playerId.value())).toBe(true);
    });

    it('should generate unique PlayerId on each call', () => {
      const id1 = PlayerId.generate();
      const id2 = PlayerId.generate();
      expect(id1.equals(id2)).toBe(false);
    });

    it('should generate a lowercase UUID', () => {
      const playerId = PlayerId.generate();
      expect(playerId.value()).toBe(playerId.value().toLowerCase());
    });
  });
});
