import { LobbyHttpPort } from '../ports/lobby-http.port';
import { PlayerRole, PlayerRoleType } from '@/features/lobby/domain/models/player.model.ts';
import { Player } from '@/features/lobby/domain/entities/player.entity.ts';

export class CreateLobby {
  constructor(private readonly lobbyHttpPort: LobbyHttpPort) {}

  async execute(playerName: string): Promise<{ code: string; playerId: string; role: PlayerRole }> {
    const describer = Player.create(playerName, PlayerRoleType.Describer);
    return this.lobbyHttpPort.createLobby(describer.name, describer.getId());
  }
}
