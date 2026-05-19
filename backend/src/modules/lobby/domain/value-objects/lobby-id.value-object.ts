import { randomUUID } from 'crypto';

export class LobbyId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static generate(): LobbyId {
    return new LobbyId(randomUUID());
  }

  static from(value: string): LobbyId {
    return new LobbyId(value);
  }

  equals(other: LobbyId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
