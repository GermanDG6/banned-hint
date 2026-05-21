import { LobbyPlayerSession, LobbyPlayerData } from './lobby-player.session';

describe('LobbyPlayerSession', () => {
  const mockData: LobbyPlayerData = {
    playerId: 'player-123',
    playerName: 'Alice',
    role: 'describer',
    durationSeconds: 180,
    lobbyCode: 'ABC123',
  };

  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('save', () => {
    it('should persist player data to sessionStorage', () => {
      LobbyPlayerSession.save(mockData);
      const stored = sessionStorage.getItem('lobby-player');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(mockData);
    });
  });

  describe('load', () => {
    it('should return player data when previously saved', () => {
      LobbyPlayerSession.save(mockData);
      const loaded = LobbyPlayerSession.load();
      expect(loaded).toEqual(mockData);
    });

    it('should return null when no data is stored', () => {
      const loaded = LobbyPlayerSession.load();
      expect(loaded).toBeNull();
    });

    it('should return null when stored data is invalid JSON', () => {
      sessionStorage.setItem('lobby-player', 'invalid json');
      const loaded = LobbyPlayerSession.load();
      expect(loaded).toBeNull();
    });

    it('should return null when stored data is missing required fields', () => {
      const invalidData = { playerName: 'Alice' }; // Missing role and durationSeconds
      sessionStorage.setItem('lobby-player', JSON.stringify(invalidData));
      const loaded = LobbyPlayerSession.load();
      expect(loaded).toBeNull();
    });

    it('should return null when stored data has wrong field types', () => {
      const invalidData = {
        playerName: 'Alice',
        role: 'describer',
        durationSeconds: 'not-a-number',
      };
      sessionStorage.setItem('lobby-player', JSON.stringify(invalidData));
      const loaded = LobbyPlayerSession.load();
      expect(loaded).toBeNull();
    });

    it('should support guesser role', () => {
      const guesserData: LobbyPlayerData = {
        ...mockData,
        playerId: 'guesser-456',
        role: 'guesser',
      };
      LobbyPlayerSession.save(guesserData);
      const loaded = LobbyPlayerSession.load();
      expect(loaded).toEqual(guesserData);
    });

    it('should persist and load lobbyCode', () => {
      const dataWithCode: LobbyPlayerData = {
        ...mockData,
        lobbyCode: 'XYZ789',
      };
      LobbyPlayerSession.save(dataWithCode);
      const loaded = LobbyPlayerSession.load();
      expect(loaded?.lobbyCode).toBe('XYZ789');
    });

    it('should return null when lobbyCode is missing', () => {
      const dataWithoutCode = {
        playerId: 'player-123',
        playerName: 'Alice',
        role: 'describer',
        durationSeconds: 180,
      };
      sessionStorage.setItem('lobby-player', JSON.stringify(dataWithoutCode));
      const loaded = LobbyPlayerSession.load();
      expect(loaded).toBeNull();
    });

    it('should return null when lobbyCode has wrong type', () => {
      const invalidData = {
        playerId: 'player-123',
        playerName: 'Alice',
        role: 'describer',
        durationSeconds: 180,
        lobbyCode: 123, // should be string
      };
      sessionStorage.setItem('lobby-player', JSON.stringify(invalidData));
      const loaded = LobbyPlayerSession.load();
      expect(loaded).toBeNull();
    });
  });

  describe('clear', () => {
    it('should remove player data from sessionStorage', () => {
      LobbyPlayerSession.save(mockData);
      LobbyPlayerSession.clear();
      const loaded = LobbyPlayerSession.load();
      expect(loaded).toBeNull();
    });

    it('should not throw when called without data stored', () => {
      expect(() => {
        LobbyPlayerSession.clear();
      }).not.toThrow();
    });
  });
});
