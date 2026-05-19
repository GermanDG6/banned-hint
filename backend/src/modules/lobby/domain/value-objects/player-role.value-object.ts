//TODO rename to PlayerRoleType
export type PlayerRole = 'describer' | 'guesser';
//TODO remove suffix VO
export class PlayerRoleVO {
  readonly value: PlayerRole;

  private constructor(value: PlayerRole) {
    this.value = value;
  }

  static create(value: string): PlayerRoleVO {
    if (value !== 'describer' && value !== 'guesser') {
      throw new Error(`Invalid PlayerRole: "${value}". Expected "describer" or "guesser".`);
    }
    return new PlayerRoleVO(value as PlayerRole);
  }

  static describer(): PlayerRoleVO {
    return new PlayerRoleVO('describer');
  }

  static guesser(): PlayerRoleVO {
    return new PlayerRoleVO('guesser');
  }

  isDescriber(): boolean {
    return this.value === 'describer';
  }

  isGuesser(): boolean {
    return this.value === 'guesser';
  }

  equals(other: PlayerRoleVO): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
