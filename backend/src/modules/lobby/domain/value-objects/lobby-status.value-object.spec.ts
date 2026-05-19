import { LobbyStatusVO } from './lobby-status.value-object';

describe('LobbyStatusVO', () => {
  describe('create', () => {
    it('should create a waiting status', () => {
      const status = LobbyStatusVO.create('waiting');
      expect(status.value).toBe('waiting');
    });

    it('should create a playing status', () => {
      const status = LobbyStatusVO.create('playing');
      expect(status.value).toBe('playing');
    });

    it('should throw error for invalid status', () => {
      expect(() => LobbyStatusVO.create('invalid')).toThrow();
    });
  });

  describe('helper methods', () => {
    it('should identify waiting status', () => {
      const status = LobbyStatusVO.waiting();
      expect(status.isWaiting()).toBe(true);
      expect(status.isPlaying()).toBe(false);
    });

    it('should identify playing status', () => {
      const status = LobbyStatusVO.playing();
      expect(status.isPlaying()).toBe(true);
      expect(status.isWaiting()).toBe(false);
    });
  });
});
