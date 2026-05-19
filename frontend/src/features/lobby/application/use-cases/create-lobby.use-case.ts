import { LobbyHttpPort } from '../ports/lobby-http.port';

export class CreateLobby {
  constructor(private readonly lobbyHttpPort: LobbyHttpPort) {}

  async execute(
    playerName: string,
    durationSeconds: number,
  ): Promise<{ code: string; playerId: string; role: 'describer' }> {
    return this.lobbyHttpPort.createLobby(playerName, durationSeconds);
  }
}
