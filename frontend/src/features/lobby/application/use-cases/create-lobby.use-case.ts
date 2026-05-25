import { LobbyHttpPort } from '../ports/lobby-http.port';
import { PlayerRole } from '@/features/lobby/domain/models/player.model.ts';

export class CreateLobby {
  constructor(private readonly lobbyHttpPort: LobbyHttpPort) {}

  async execute(
    playerName: string,
    playerId: string,
  ): Promise<{ code: string; playerId: string; role: PlayerRole }> {
    return this.lobbyHttpPort.createLobby(playerName, playerId);
  }
}
