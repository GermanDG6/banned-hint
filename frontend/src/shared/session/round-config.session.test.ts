import { describe, it, expect, beforeEach } from 'vitest';
import { RoundConfigSession } from './round-config.session';

describe('RoundConfigSession', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('should save and load a valid config', () => {
    RoundConfigSession.save({ minutes: 1, seconds: 30 });
    expect(RoundConfigSession.load()).toEqual({ minutes: 1, seconds: 30 });
  });

  it('should return null when no config is saved', () => {
    expect(RoundConfigSession.load()).toBeNull();
  });

  it('should return null when stored value is malformed', () => {
    sessionStorage.setItem('round-config', 'not-json');
    expect(RoundConfigSession.load()).toBeNull();
  });

  it('should return null when stored object has wrong shape', () => {
    sessionStorage.setItem('round-config', JSON.stringify({ foo: 'bar' }));
    expect(RoundConfigSession.load()).toBeNull();
  });

  it('should clear the stored config', () => {
    RoundConfigSession.save({ minutes: 1, seconds: 0 });
    RoundConfigSession.clear();
    expect(RoundConfigSession.load()).toBeNull();
  });
});
