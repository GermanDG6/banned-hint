export const PlayerRoleType = {
  Describer: 'describer',
  Guesser: 'guesser',
} as const;

export type PlayerRole = (typeof PlayerRoleType)[keyof typeof PlayerRoleType];
