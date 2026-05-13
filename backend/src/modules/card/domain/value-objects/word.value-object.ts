import { EmptyWordException } from '../exceptions/empty-word.exception';

export class Word {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Word {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new EmptyWordException();
    }
    return new Word(trimmed);
  }

  equals(other: Word): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
