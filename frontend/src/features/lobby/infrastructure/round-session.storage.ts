import { RoundSession } from '@/features/lobby/domain/models/round-session.model';

const SESSION_KEY = 'round-session';

export class RoundSessionStorage {
  static save(session: RoundSession): void {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  static load(): RoundSession | null {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return RoundSessionStorage.isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  static clear(): void {
    sessionStorage.removeItem(SESSION_KEY);
  }

  private static isValid(value: unknown): value is RoundSession {
    return (
      typeof value === 'object' &&
      value !== null &&
      typeof (value as Record<string, unknown>).startAt === 'number' &&
      typeof (value as Record<string, unknown>).durationSeconds === 'number' &&
      // card is optional, so we don't validate it if present
      ((value as Record<string, unknown>).card === undefined ||
        typeof (value as Record<string, unknown>).card === 'object')
    );
  }
}
