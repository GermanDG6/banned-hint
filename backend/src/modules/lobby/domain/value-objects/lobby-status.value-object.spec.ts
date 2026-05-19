import { LobbyStatus } from './lobby-status.value-object';

describe('LobbyStatusVO', () => {
  describe('create', () => {
    it('should create a waiting status', () => {
      const status = LobbyStatus.create('waiting');
      expect(status.value).toBe('waiting');
    });

    it('should create a playing status', () => {
      const status = LobbyStatus.create('playing');
      expect(status.value).toBe('playing');
    });

    it('should throw error for invalid status', () => {
      expect(() => LobbyStatus.create('invalid')).toThrow();
    });
  });

  describe('helper methods', () => {
    it('should identify waiting status', () => {
      const status = LobbyStatus.waiting();
      expect(status.isWaiting()).toBe(true);
      expect(status.isPlaying()).toBe(false);
    });

    it('should identify playing status', () => {
      const status = LobbyStatus.playing();
      expect(status.isPlaying()).toBe(true);
      expect(status.isWaiting()).toBe(false);
    });
  });
});
