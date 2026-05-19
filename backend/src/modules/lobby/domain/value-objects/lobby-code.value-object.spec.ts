import { LobbyCode } from './lobby-code.value-object';

describe('LobbyCode', () => {
  describe('generate', () => {
    it('should generate a 6-character alphanumeric code', () => {
      const code = LobbyCode.generate();

      expect(code.value).toMatch(/^[A-Z0-9]{6}$/);
    });

    it('should generate different codes each time', () => {
      const code1 = LobbyCode.generate();
      const code2 = LobbyCode.generate();

      // Statistically should be different (6^36 combinations)
      expect(code1.value).not.toBe(code2.value);
    });
  });

  describe('from', () => {
    it('should create a LobbyCode from a valid 6-character code', () => {
      const code = LobbyCode.from('ABC123');

      expect(code.value).toBe('ABC123');
    });

    it('should uppercase the input', () => {
      const code = LobbyCode.from('abc123');

      expect(code.value).toBe('ABC123');
    });

    it('should trim whitespace', () => {
      const code = LobbyCode.from('  ABC123  ');

      expect(code.value).toBe('ABC123');
    });

    it('should throw Error when code is not 6 characters', () => {
      expect(() => LobbyCode.from('ABC12')).toThrow();
      expect(() => LobbyCode.from('ABC1234')).toThrow();
    });

    it('should throw Error when code contains invalid characters', () => {
      expect(() => LobbyCode.from('ABC!@#')).toThrow();
      expect(() => LobbyCode.from('ABC äöü')).toThrow();
    });
  });

  describe('equals', () => {
    it('should return true when comparing LobbyCode with same value', () => {
      const code1 = LobbyCode.from('ABC123');
      const code2 = LobbyCode.from('ABC123');

      expect(code1.equals(code2)).toBe(true);
    });

    it('should return false when comparing LobbyCode with different values', () => {
      const code1 = LobbyCode.from('ABC123');
      const code2 = LobbyCode.from('XYZ789');

      expect(code1.equals(code2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the string value', () => {
      const code = LobbyCode.from('ABC123');

      expect(code.toString()).toBe('ABC123');
    });
  });
});
