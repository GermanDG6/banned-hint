import { describe, it, expect } from 'vitest';
import { Player } from './player.entity';
import { InvalidPlayerIdException } from '../exceptions/invalid-player-id.exception';
import { InvalidPlayerNameException } from '../exceptions/invalid-player-name.exception';
import { InvalidPlayerRoleException } from '../exceptions/invalid-player-role.exception';
import { PlayerRoleType } from '../models/player.model';

describe('Player', () => {
  const validUUID1 = '550e8400-e29b-41d4-a716-446655440000';
  const validUUID2 = '550e8400-e29b-41d4-a716-446655440001';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

  describe('create', () => {
    it('should create a Player with valid name and role (describer)', () => {
      const player = Player.create('Alice', PlayerRoleType.Describer, validUUID1);

      expect(player.id.value).toBe(validUUID1.toLowerCase());
      expect(player.name).toBe('Alice');
      expect(player.role).toBe(PlayerRoleType.Describer);
    });

    it('should create a Player with valid name and role (guesser)', () => {
      const player = Player.create('Bob', PlayerRoleType.Guesser, validUUID2);

      expect(player.id.value).toBe(validUUID2.toLowerCase());
      expect(player.name).toBe('Bob');
      expect(player.role).toBe(PlayerRoleType.Guesser);
    });

    it('should trim whitespace from id and name', () => {
      const player = Player.create('  Alice  ', PlayerRoleType.Describer, `  ${validUUID1}  `);

      expect(player.id.value).toBe(validUUID1.toLowerCase());
      expect(player.name).toBe('Alice');
    });

    it('should generate a UUID when id is not provided', () => {
      const player = Player.create('Alice', PlayerRoleType.Describer);

      expect(uuidRegex.test(player.id.value)).toBe(true);
      expect(player.name).toBe('Alice');
      expect(player.role).toBe(PlayerRoleType.Describer);
    });

    it('should generate different UUIDs for different players without id', () => {
      const player1 = Player.create('Alice', PlayerRoleType.Describer);
      const player2 = Player.create('Bob', PlayerRoleType.Guesser);

      expect(player1.id.equals(player2.id)).toBe(false);
    });

    it('should throw InvalidPlayerIdException when id is not a valid UUID', () => {
      expect(() => Player.create('Alice', PlayerRoleType.Describer, 'player-1')).toThrow(
        InvalidPlayerIdException,
      );
    });

    it('should throw InvalidPlayerIdException when id is empty', () => {
      expect(() => Player.create('Alice', PlayerRoleType.Describer, '')).toThrow(
        InvalidPlayerIdException,
      );
    });

    it('should throw InvalidPlayerIdException when id is only whitespace', () => {
      expect(() => Player.create('Alice', PlayerRoleType.Describer, '   ')).toThrow(
        InvalidPlayerIdException,
      );
    });

    it('should throw InvalidPlayerNameException when name is empty', () => {
      expect(() => Player.create('', PlayerRoleType.Describer, validUUID1)).toThrow(
        InvalidPlayerNameException,
      );
    });

    it('should throw InvalidPlayerNameException when name is only whitespace', () => {
      expect(() => Player.create('   ', PlayerRoleType.Describer, validUUID1)).toThrow(
        InvalidPlayerNameException,
      );
    });

    it('should throw InvalidPlayerNameException when name is not a string', () => {
      expect(() =>
        Player.create(123 as unknown as string, PlayerRoleType.Describer, validUUID1),
      ).toThrow(InvalidPlayerNameException);
    });

    it('should throw InvalidPlayerRoleException when role is invalid', () => {
      expect(() => Player.create('Alice', 'invalid-role', validUUID1)).toThrow(
        InvalidPlayerRoleException,
      );
    });

    it('should throw InvalidPlayerRoleException when role is null', () => {
      expect(() => Player.create('Alice', null as unknown as string, validUUID1)).toThrow(
        InvalidPlayerRoleException,
      );
    });
  });

  describe('properties', () => {
    it('should have readonly id, name, and role properties', () => {
      const player = Player.create('Alice', PlayerRoleType.Describer, validUUID1);

      expect(player.getId()).toBe(validUUID1.toLowerCase());
      expect(player.name).toBe('Alice');
      expect(player.role).toBe(PlayerRoleType.Describer);

      // Properties should be readonly (TypeScript validates this at compile time)
      // Immutability is enforced at runtime by the constructor pattern
    });
  });
});
