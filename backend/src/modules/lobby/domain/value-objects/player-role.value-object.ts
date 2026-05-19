export const PlayerRoleType = {
  Describer: 'describer',
  Guesser: 'guesser',
} as const;

export type PlayerRoleType = (typeof PlayerRoleType)[keyof typeof PlayerRoleType];

export class PlayerRole {
  readonly value: PlayerRoleType;

  private constructor(value: PlayerRoleType) {
    this.value = value;
  }

  static create(value: string): PlayerRole {
    if (value !== PlayerRoleType.Describer && value !== PlayerRoleType.Guesser) {
      throw new Error(
        `Invalid PlayerRole: "${value}". Expected "${PlayerRoleType.Describer}" or "${PlayerRoleType.Guesser}".`,
      );
    }
    return new PlayerRole(value as PlayerRoleType);
  }

  static describer(): PlayerRole {
    return new PlayerRole(PlayerRoleType.Describer);
  }

  static guesser(): PlayerRole {
    return new PlayerRole(PlayerRoleType.Guesser);
  }

  isDescriber(): boolean {
    return this.value === PlayerRoleType.Describer;
  }

  isGuesser(): boolean {
    return this.value === PlayerRoleType.Guesser;
  }

  equals(other: PlayerRole): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
