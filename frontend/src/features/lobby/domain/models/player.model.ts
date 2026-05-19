export const PlayerRoleType = {
  Describer: 'describer',
  Guesser: 'guesser',
} as const;

export type PlayerRole = (typeof PlayerRoleType)[keyof typeof PlayerRoleType];

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
}
