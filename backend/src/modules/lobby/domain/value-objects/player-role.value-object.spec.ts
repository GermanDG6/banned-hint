import { PlayerRoleVO } from './player-role.value-object';

describe('PlayerRoleVO', () => {
  describe('create', () => {
    it('should create a describer role', () => {
      const role = PlayerRoleVO.create('describer');
      expect(role.value).toBe('describer');
    });

    it('should create a guesser role', () => {
      const role = PlayerRoleVO.create('guesser');
      expect(role.value).toBe('guesser');
    });

    it('should throw error for invalid role', () => {
      expect(() => PlayerRoleVO.create('invalid')).toThrow();
    });
  });

  describe('helper methods', () => {
    it('should identify describer role', () => {
      const role = PlayerRoleVO.describer();
      expect(role.isDescriber()).toBe(true);
      expect(role.isGuesser()).toBe(false);
    });

    it('should identify guesser role', () => {
      const role = PlayerRoleVO.guesser();
      expect(role.isGuesser()).toBe(true);
      expect(role.isDescriber()).toBe(false);
    });
  });
});
