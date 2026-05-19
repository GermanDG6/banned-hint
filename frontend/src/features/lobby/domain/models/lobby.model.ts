import { Player } from '@/features/lobby/domain/models/player.model.ts';

export type LobbyStatus = 'waiting' | 'playing'; // TODO: refactor string literal types by as const object

export interface Lobby {
  code: string;
  status: LobbyStatus;
  players: Player[];
}
