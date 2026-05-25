import { Lobby } from '@/features/lobby/domain/models/lobby.model.ts';
import { PlayerRole } from '@/features/lobby/domain/models/player.model.ts';

export interface LobbyHttpPort {
  createLobby(
    playerName: string,
    playerId: string,
  ): Promise<{
    code: string;
    playerId: string;
    role: PlayerRole;
  }>;

  getLobby(code: string): Promise<Lobby | null>;
}
