import { InvalidPlayerIdException } from '../exceptions/invalid-player-id.exception';

export class PlayerId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): PlayerId {
    const trimmed = value.trim();

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(trimmed)) {
      throw new InvalidPlayerIdException(value);
    }

    return new PlayerId(trimmed.toLowerCase());
  }

  static generate(): PlayerId {
    return new PlayerId(crypto.randomUUID());
  }

  equals(other: PlayerId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
