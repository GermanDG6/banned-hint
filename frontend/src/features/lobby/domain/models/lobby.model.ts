import { Player } from '@/features/lobby/domain/models/player.model.ts';

export const LobbyStatusType = {
  Waiting: 'waiting',
  Playing: 'playing',
} as const;

export type LobbyStatus = (typeof LobbyStatusType)[keyof typeof LobbyStatusType];

export interface Lobby {
  code: string;
  status: LobbyStatus;
  players: Player[];
}
