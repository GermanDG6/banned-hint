export type PlayerRoleType = 'describer' | 'guesser'; //TODO - consider using an enum instead of a string literal type for better type safety and maintainability

export class PlayerRole {
  readonly value: PlayerRoleType;

  private constructor(value: PlayerRoleType) {
    this.value = value;
  }

  static create(value: string): PlayerRole {
    if (value !== 'describer' && value !== 'guesser') {
      throw new Error(`Invalid PlayerRole: "${value}". Expected "describer" or "guesser".`);
    }
    return new PlayerRole(value as PlayerRoleType);
  }

  static describer(): PlayerRole {
    return new PlayerRole('describer');
  }

  static guesser(): PlayerRole {
    return new PlayerRole('guesser');
  }

  isDescriber(): boolean {
    return this.value === 'describer';
  }

  isGuesser(): boolean {
    return this.value === 'guesser';
  }

  equals(other: PlayerRole): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
