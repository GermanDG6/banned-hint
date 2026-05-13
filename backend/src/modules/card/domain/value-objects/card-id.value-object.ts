import { randomUUID } from 'crypto';

export class CardId {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static generate(): CardId {
    return new CardId(randomUUID());
  }

  static from(value: string): CardId {
    return new CardId(value);
  }

  equals(other: CardId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
