import { Injectable } from '@nestjs/common';
import { Lobby } from '../../domain/entities/lobby.entity';
import { LobbyRepository } from '../../domain/repositories/lobby.repository';

/**
 * In-memory implementation of LobbyRepository for development and testing.
 * Stores lobbies in a Map indexed by lobby code.
 * Data is lost on server restart (not suitable for production).
 */
@Injectable()
export class InMemoryLobbyRepository implements LobbyRepository {
  private readonly lobbies: Map<string, Lobby> = new Map();

  async save(lobby: Lobby): Promise<void> {
    this.lobbies.set(lobby.code.value, lobby);
  }

  async findByCode(code: string): Promise<Lobby | null> {
    const lobby = this.lobbies.get(code);
    return lobby ?? null;
  }
}
