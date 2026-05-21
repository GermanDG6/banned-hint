import { RoundSessionStorage } from './round-session.storage';
import { RoundSession } from '@/features/lobby/domain/models/round-session.model';

describe('RoundSessionStorage', () => {
  const mockSession: RoundSession = {
    startAt: 1621234567890,
    durationSeconds: 180,
    card: {
      id: 'card-001',
      word: 'test',
      bannedWords: ['a', 'b', 'c', 'd'],
    },
  };

  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('save', () => {
    it('should persist round session to sessionStorage', () => {
      RoundSessionStorage.save(mockSession);
      const stored = sessionStorage.getItem('round-session');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(mockSession);
    });
  });

  describe('load', () => {
    it('should return round session when previously saved', () => {
      RoundSessionStorage.save(mockSession);
      const loaded = RoundSessionStorage.load();
      expect(loaded).toEqual(mockSession);
    });

    it('should return null when no data is stored', () => {
      const loaded = RoundSessionStorage.load();
      expect(loaded).toBeNull();
    });

    it('should return null when stored data is invalid JSON', () => {
      sessionStorage.setItem('round-session', 'invalid json');
      const loaded = RoundSessionStorage.load();
      expect(loaded).toBeNull();
    });

    it('should return null when stored data is missing required fields', () => {
      const invalidData = { startAt: 1621234567890 }; // Missing durationSeconds
      sessionStorage.setItem('round-session', JSON.stringify(invalidData));
      const loaded = RoundSessionStorage.load();
      expect(loaded).toBeNull();
    });

    it('should return null when stored data has wrong field types', () => {
      const invalidData = {
        startAt: 'not-a-number',
        durationSeconds: 180,
      };
      sessionStorage.setItem('round-session', JSON.stringify(invalidData));
      const loaded = RoundSessionStorage.load();
      expect(loaded).toBeNull();
    });

    it('should load valid RoundSession without card (Guesser scenario)', () => {
      const guesserSession: RoundSession = {
        startAt: 1621234567890,
        durationSeconds: 180,
      };
      RoundSessionStorage.save(guesserSession);
      const loaded = RoundSessionStorage.load();
      expect(loaded).toEqual(guesserSession);
      expect(loaded?.card).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should remove round session from sessionStorage', () => {
      RoundSessionStorage.save(mockSession);
      RoundSessionStorage.clear();
      const loaded = RoundSessionStorage.load();
      expect(loaded).toBeNull();
    });

    it('should not throw when called without data stored', () => {
      expect(() => {
        RoundSessionStorage.clear();
      }).not.toThrow();
    });
  });
});
