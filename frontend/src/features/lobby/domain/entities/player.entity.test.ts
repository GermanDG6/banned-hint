import { describe, it, expect } from 'vitest';
import { Player } from './player.entity';
import { InvalidPlayerIdException } from '../exceptions/invalid-player-id.exception';
import { InvalidPlayerNameException } from '../exceptions/invalid-player-name.exception';
import { InvalidPlayerRoleException } from '../exceptions/invalid-player-role.exception';
import { PlayerRoleType } from '../models/player.model';

describe('Player', () => {
  describe('create', () => {
    it('should create a Player with valid id, name and role (describer)', () => {
      const player = Player.create('player-1', 'Alice', PlayerRoleType.Describer);

      expect(player.id).toBe('player-1');
      expect(player.name).toBe('Alice');
      expect(player.role).toBe(PlayerRoleType.Describer);
    });

    it('should create a Player with valid id, name and role (guesser)', () => {
      const player = Player.create('player-2', 'Bob', PlayerRoleType.Guesser);

      expect(player.id).toBe('player-2');
      expect(player.name).toBe('Bob');
      expect(player.role).toBe(PlayerRoleType.Guesser);
    });

    it('should trim whitespace from id and name', () => {
      const player = Player.create('  player-1  ', '  Alice  ', PlayerRoleType.Describer);

      expect(player.id).toBe('player-1');
      expect(player.name).toBe('Alice');
    });

    it('should throw InvalidPlayerIdException when id is empty', () => {
      expect(() => Player.create('', 'Alice', PlayerRoleType.Describer)).toThrow(
        InvalidPlayerIdException,
      );
    });

    it('should throw InvalidPlayerIdException when id is only whitespace', () => {
      expect(() => Player.create('   ', 'Alice', PlayerRoleType.Describer)).toThrow(
        InvalidPlayerIdException,
      );
    });

    it('should throw InvalidPlayerIdException when id is not a string', () => {
      expect(() =>
        Player.create(123 as unknown as string, 'Alice', PlayerRoleType.Describer),
      ).toThrow(InvalidPlayerIdException);
    });

    it('should throw InvalidPlayerNameException when name is empty', () => {
      expect(() => Player.create('player-1', '', PlayerRoleType.Describer)).toThrow(
        InvalidPlayerNameException,
      );
    });

    it('should throw InvalidPlayerNameException when name is only whitespace', () => {
      expect(() => Player.create('player-1', '   ', PlayerRoleType.Describer)).toThrow(
        InvalidPlayerNameException,
      );
    });

    it('should throw InvalidPlayerNameException when name is not a string', () => {
      expect(() =>
        Player.create('player-1', 123 as unknown as string, PlayerRoleType.Describer),
      ).toThrow(InvalidPlayerNameException);
    });

    it('should throw InvalidPlayerRoleException when role is invalid', () => {
      expect(() => Player.create('player-1', 'Alice', 'invalid-role')).toThrow(
        InvalidPlayerRoleException,
      );
    });

    it('should throw InvalidPlayerRoleException when role is null', () => {
      expect(() => Player.create('player-1', 'Alice', null as unknown as string)).toThrow(
        InvalidPlayerRoleException,
      );
    });
  });

  describe('fromRaw', () => {
    it('should create a Player from a valid raw object', () => {
      const player = Player.fromRaw({
        id: 'player-1',
        name: 'Alice',
        role: PlayerRoleType.Describer,
      });

      expect(player.id).toBe('player-1');
      expect(player.name).toBe('Alice');
      expect(player.role).toBe(PlayerRoleType.Describer);
    });

    it('should throw InvalidPlayerIdException when id is missing', () => {
      expect(() =>
        Player.fromRaw({
          name: 'Alice',
          role: PlayerRoleType.Describer,
        }),
      ).toThrow(InvalidPlayerIdException);
    });

    it('should throw InvalidPlayerIdException when id is not a string', () => {
      expect(() =>
        Player.fromRaw({
          id: 123,
          name: 'Alice',
          role: PlayerRoleType.Describer,
        }),
      ).toThrow(InvalidPlayerIdException);
    });

    it('should throw InvalidPlayerNameException when name is missing', () => {
      expect(() =>
        Player.fromRaw({
          id: 'player-1',
          role: PlayerRoleType.Describer,
        }),
      ).toThrow(InvalidPlayerNameException);
    });

    it('should throw InvalidPlayerNameException when name is not a string', () => {
      expect(() =>
        Player.fromRaw({
          id: 'player-1',
          name: 123,
          role: PlayerRoleType.Describer,
        }),
      ).toThrow(InvalidPlayerNameException);
    });

    it('should throw InvalidPlayerRoleException when role is missing', () => {
      expect(() =>
        Player.fromRaw({
          id: 'player-1',
          name: 'Alice',
        }),
      ).toThrow(InvalidPlayerRoleException);
    });

    it('should throw InvalidPlayerRoleException when role is not a string', () => {
      expect(() =>
        Player.fromRaw({
          id: 'player-1',
          name: 'Alice',
          role: 123,
        }),
      ).toThrow(InvalidPlayerRoleException);
    });

    it('should throw InvalidPlayerRoleException when role is invalid', () => {
      expect(() =>
        Player.fromRaw({
          id: 'player-1',
          name: 'Alice',
          role: 'invalid-role',
        }),
      ).toThrow(InvalidPlayerRoleException);
    });

    it('should throw InvalidPlayerIdException when data is null', () => {
      expect(() => Player.fromRaw(null)).toThrow(InvalidPlayerIdException);
    });

    it('should throw InvalidPlayerIdException when data is primitive value', () => {
      expect(() => Player.fromRaw('string')).toThrow(InvalidPlayerIdException);
    });

    it('should throw InvalidPlayerIdException when data is a number', () => {
      expect(() => Player.fromRaw(42)).toThrow(InvalidPlayerIdException);
    });
  });

  describe('properties', () => {
    it('should have readonly id, name, and role properties', () => {
      const player = Player.create('player-1', 'Alice', PlayerRoleType.Describer);

      expect(player.id).toBe('player-1');
      expect(player.name).toBe('Alice');
      expect(player.role).toBe(PlayerRoleType.Describer);

      // Properties should be readonly (TypeScript validates this at compile time)
      // Immutability is enforced at runtime by the constructor pattern
    });
  });
});
