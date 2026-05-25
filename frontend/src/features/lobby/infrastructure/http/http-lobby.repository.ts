import { LobbyHttpPort } from '../../application/ports/lobby-http.port';
import { Lobby } from '../../domain/models/lobby.model';
import { Player } from '../../domain/entities/player.entity';
import { PlayerRoleType, PlayerRole } from '../../domain/models/player.model';
import { HttpClient } from '@/shared/http/http-client.port';
import { HttpClientException } from '@/shared/http/http-client.exception';
import { InvalidPlayerRoleException } from '../../domain/exceptions/invalid-player-role.exception';
import { LobbyApiResponse } from './lobby-api-response.type';

type CreateLobbyApiResponse = {
  code: string;
  playerId: string;
  role: string;
};

export class HttpLobbyRepository implements LobbyHttpPort {
  private readonly baseUrl = 'http://localhost:3000/api';

  constructor(private readonly httpClient: HttpClient) {}

  async createLobby(
    playerName: string,
    playerId: string,
  ): Promise<{
    code: string;
    playerId: string;
    role: PlayerRole;
  }> {
    const response = await this.httpClient.post<CreateLobbyApiResponse>(`${this.baseUrl}/lobby`, {
      playerName,
      playerId,
    });

    return {
      code: response.code,
      playerId: response.playerId,
      role: this.mapRole(response.role),
    };
  }

  async getLobby(code: string): Promise<Lobby | null> {
    try {
      const response = await this.httpClient.get<LobbyApiResponse>(`${this.baseUrl}/lobby/${code}`);
      return this.mapToLobby(response);
    } catch (error) {
      // Si el lobby no existe, la API devuelve 404 — es un resultado válido (no una excepción)
      if (error instanceof HttpClientException && error.status === 404) {
        return null;
      }
      // Otros errores (red, 5xx) se propagan
      throw error;
    }
  }

  private mapToLobby(response: LobbyApiResponse): Lobby {
    return {
      code: response.code,
      status: response.status,
      players: response.players.map((p) => this.mapPlayer(p)),
    };
  }

  private mapPlayer(p: { id: string; name: string; role: string }): Player {
    return Player.create(p.name, this.mapRole(p.role), p.id);
  }

  private mapRole(role: string): PlayerRole {
    if (role === PlayerRoleType.Describer || role === PlayerRoleType.Guesser) {
      return role as PlayerRole;
    }
    throw new InvalidPlayerRoleException(role);
  }
}
