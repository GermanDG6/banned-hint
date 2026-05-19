import { Player } from './player.entity';
import { PlayerRoleType } from '../value-objects/player-role.value-object';

describe('Player', () => {
  describe('create', () => {
    it('should create a player with describer role', () => {
      const player = Player.create('socket-1', 'Alice', PlayerRoleType.Describer);

      expect(player.id).toBe('socket-1');
      expect(player.name).toBe('Alice');
      expect(player.isDescriber()).toBe(true);
    });

    it('should create a player with guesser role', () => {
      const player = Player.create('socket-2', 'Bob', PlayerRoleType.Guesser);

      expect(player.id).toBe('socket-2');
      expect(player.name).toBe('Bob');
      expect(player.isGuesser()).toBe(true);
    });
  });

  describe('role checks', () => {
    it('should correctly identify describer', () => {
      const player = Player.create('socket-1', 'Alice', PlayerRoleType.Describer);

      expect(player.isDescriber()).toBe(true);
      expect(player.isGuesser()).toBe(false);
    });

    it('should correctly identify guesser', () => {
      const player = Player.create('socket-2', 'Bob', PlayerRoleType.Guesser);

      expect(player.isDescriber()).toBe(false);
      expect(player.isGuesser()).toBe(true);
    });
  });
});
