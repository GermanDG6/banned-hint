import { Lobby } from '@/features/lobby/domain/models/lobby.model.ts';

export interface LobbyHttpPort {
  createLobby(
    playerName: string,
    durationSeconds: number,
  ): Promise<{
    code: string;
    playerId: string;
    role: 'describer';
  }>;

  getLobby(code: string): Promise<Lobby | null>;
}
