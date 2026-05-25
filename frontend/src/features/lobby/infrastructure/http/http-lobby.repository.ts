import { LobbyHttpPort } from '../../application/ports/lobby-http.port';
import { Lobby } from '../../domain/models/lobby.model';
import { Player } from '../../domain/entities/player.entity';
import { PlayerRoleType } from '../../domain/models/player.model';
import { HttpClient } from '@/shared/http/http-client.port';
import { HttpClientException } from '@/shared/http/http-client.exception';
import { LobbyApiResponse } from './lobby-api-response.type';

export class HttpLobbyRepository implements LobbyHttpPort {
  private readonly baseUrl = 'http://localhost:3000/api';

  constructor(private readonly httpClient: HttpClient) {}

  async createLobby(
    playerName: string,
    durationSeconds: number,
  ): Promise<{
    code: string;
    playerId: string;
    role: 'describer';
  }> {
    return this.httpClient.post<{
      code: string;
      playerId: string;
      role: 'describer';
    }>(`${this.baseUrl}/lobby`, {
      playerName,
      durationSeconds,
    });
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
    return Player.create(
      p.id,
      p.name,
      p.role === PlayerRoleType.Describer ? PlayerRoleType.Describer : PlayerRoleType.Guesser,
    );
  }
}
