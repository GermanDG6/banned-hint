const SESSION_KEY = 'round-config';

export interface RoundConfig {
  minutes: number;
  seconds: number;
}

export class RoundConfigSession {
  static save(config: RoundConfig): void {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(config));
  }

  static load(): RoundConfig | null {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return RoundConfigSession.isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  static clear(): void {
    sessionStorage.removeItem(SESSION_KEY);
  }

  private static isValid(value: unknown): value is RoundConfig {
    return (
      typeof value === 'object' &&
      value !== null &&
      typeof (value as Record<string, unknown>).minutes === 'number' &&
      typeof (value as Record<string, unknown>).seconds === 'number'
    );
  }
}
