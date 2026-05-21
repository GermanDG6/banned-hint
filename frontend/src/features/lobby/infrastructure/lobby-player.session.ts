import { PlayerRole } from '@/features/lobby/domain/models/player.model';

const SESSION_KEY = 'lobby-player';

export interface LobbyPlayerData {
  playerId: string;
  playerName: string;
  role: PlayerRole;
  durationSeconds: number;
  lobbyCode: string;
}

export class LobbyPlayerSession {
  static save(data: LobbyPlayerData): void {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  }

  static load(): LobbyPlayerData | null {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return LobbyPlayerSession.isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  static clear(): void {
    sessionStorage.removeItem(SESSION_KEY);
  }

  private static isValid(value: unknown): value is LobbyPlayerData {
    return (
      typeof value === 'object' &&
      value !== null &&
      typeof (value as Record<string, unknown>).playerId === 'string' &&
      typeof (value as Record<string, unknown>).playerName === 'string' &&
      typeof (value as Record<string, unknown>).role === 'string' &&
      typeof (value as Record<string, unknown>).durationSeconds === 'number' &&
      typeof (value as Record<string, unknown>).lobbyCode === 'string'
    );
  }
}
