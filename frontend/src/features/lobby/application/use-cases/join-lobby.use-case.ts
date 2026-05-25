import { LobbyHttpPort } from '../ports/lobby-http.port';
import { LobbySocket } from '../ports/lobby-socket.port';
import { LobbyNotFoundException } from '../../domain/exceptions/lobby-not-found.exception';
import { PlayerRole } from '@/features/lobby/domain/models/player.model.ts';
import { Player } from '@/features/lobby/domain/entities/player.entity.ts';

export class JoinLobby {
  constructor(
    private readonly lobbyHttpPort: LobbyHttpPort,
    private readonly lobbySocket: LobbySocket,
  ) {}

  async execute(
    code: string,
    playerName: string,
    role: PlayerRole,
    playerId?: string,
  ): Promise<void> {
    const lobby = await this.lobbyHttpPort.getLobby(code);
    if (!lobby) {
      throw new LobbyNotFoundException(code);
    }
    const player = Player.create(playerName, role, playerId);
    this.lobbySocket.connect();
    this.lobbySocket.joinLobby(code, player);
  }
}
