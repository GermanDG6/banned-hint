import { Lobby } from '../entities/lobby.entity';

export const LOBBY_REPOSITORY = Symbol('LobbyRepository');

export interface LobbyRepository {
  save(lobby: Lobby): Promise<void>;
  findByCode(code: string): Promise<Lobby | null>;
}
