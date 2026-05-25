import { Lobby } from '@/features/lobby/domain/models/lobby.model.ts';
import { LobbyCode } from '@/features/lobby/domain/value-objects/lobby-code.value-object.ts';
import { PlayerId } from '@/features/lobby/domain/value-objects/player-id.value-object.ts';
import { PlayerRole } from '@/features/lobby/domain/models/player.model.ts';

export interface LobbyHttpPort {
  createLobby(
    playerName: string,
    durationSeconds: number,
  ): Promise<{
    code: LobbyCode;
    playerId: PlayerId;
    role: PlayerRole;
  }>;

  getLobby(code: string): Promise<Lobby | null>;
}
