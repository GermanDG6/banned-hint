import { LobbyId } from './lobby-id.value-object';

describe('LobbyId', () => {
  describe('generate', () => {
    it('should generate a unique LobbyId each time', () => {
      const lobbyId1 = LobbyId.generate();
      const lobbyId2 = LobbyId.generate();

      expect(lobbyId1.value).not.toBe(lobbyId2.value);
    });

    it('should generate a valid UUID string', () => {
      const lobbyId = LobbyId.generate();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(lobbyId.value).toMatch(uuidRegex);
    });
  });

  describe('from', () => {
    it('should create a LobbyId from an existing value', () => {
      const value = '123e4567-e89b-12d3-a456-426614174000';
      const lobbyId = LobbyId.from(value);

      expect(lobbyId.value).toBe(value);
    });
  });

  describe('equals', () => {
    it('should return true when comparing LobbyIds with the same value', () => {
      const value = '123e4567-e89b-12d3-a456-426614174000';
      const lobbyId1 = LobbyId.from(value);
      const lobbyId2 = LobbyId.from(value);

      expect(lobbyId1.equals(lobbyId2)).toBe(true);
    });

    it('should return false when comparing LobbyIds with different values', () => {
      const lobbyId1 = LobbyId.generate();
      const lobbyId2 = LobbyId.generate();

      expect(lobbyId1.equals(lobbyId2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the string value of the LobbyId', () => {
      const value = '123e4567-e89b-12d3-a456-426614174000';
      const lobbyId = LobbyId.from(value);

      expect(lobbyId.toString()).toBe(value);
    });
  });
});
