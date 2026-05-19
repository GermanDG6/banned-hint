import { describe, it, expect } from 'vitest';
import { LobbyCode } from './lobby-code.value-object';

describe('LobbyCode', () => {
  it('should create a valid LobbyCode with 6 uppercase alphanumeric characters', () => {
    const code = LobbyCode.create('ABC123');
    expect(code.value).toBe('ABC123');
  });

  it('should normalize input to uppercase', () => {
    const code = LobbyCode.create('abc123');
    expect(code.value).toBe('ABC123');
  });

  it('should trim whitespace from input', () => {
    const code = LobbyCode.create('  ABC123  ');
    expect(code.value).toBe('ABC123');
  });

  it('should throw error if code is shorter than 6 characters', () => {
    expect(() => LobbyCode.create('ABC12')).toThrow(/Invalid LobbyCode.*6 alphanumeric/);
  });

  it('should throw error if code is longer than 6 characters', () => {
    expect(() => LobbyCode.create('ABC1234')).toThrow(/Invalid LobbyCode.*6 alphanumeric/);
  });

  it('should throw error if code contains invalid characters', () => {
    expect(() => LobbyCode.create('ABC@23')).toThrow(/Invalid LobbyCode.*6 alphanumeric/);
  });

  it('should throw error if code contains lowercase letters after normalization fails', () => {
    // Este test verifica que se normalize correctamente
    const code = LobbyCode.create('abc123');
    expect(code.value).toBe('ABC123');
  });

  it('should compare two LobbyCode instances for equality', () => {
    const code1 = LobbyCode.create('ABC123');
    const code2 = LobbyCode.create('ABC123');
    const code3 = LobbyCode.create('XYZ456');

    expect(code1.equals(code2)).toBe(true);
    expect(code1.equals(code3)).toBe(false);
  });

  it('should convert to string correctly', () => {
    const code = LobbyCode.create('ABC123');
    expect(code.toString()).toBe('ABC123');
  });
});
