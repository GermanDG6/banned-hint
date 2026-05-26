import { InvalidPlayerIdException } from '../exceptions/invalid-player-id.exception';

export class PlayerId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
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
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
  value(): string {
    return this._value;
  }
}
