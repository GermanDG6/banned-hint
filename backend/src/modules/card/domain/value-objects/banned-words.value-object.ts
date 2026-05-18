import { EmptyBannedWordsException } from '../exceptions/empty-banned-words.exception';

export class BannedWords {
  readonly values: readonly string[];

  private constructor(values: string[]) {
    this.values = Object.freeze([...values]);
  }

  static create(values: string[]): BannedWords {
    const trimmedValues = values.map((word) => word.trim()).filter((word) => word.length > 0);

    if (trimmedValues.length < 4) {
      throw new EmptyBannedWordsException(); //TODO Reemplazar por InsufficientBannedWordsException
    }

    return new BannedWords(trimmedValues);
  }

  contains(word: string): boolean {
    const trimmedWord = word.trim().toLowerCase();
    return this.values.some((w) => w.toLowerCase() === trimmedWord);
  }

  equals(other: BannedWords): boolean {
    if (this.values.length !== other.values.length) {
      return false;
    }
    const sorted1 = [...this.values].sort();
    const sorted2 = [...other.values].sort();
    return sorted1.every((val, idx) => val === sorted2[idx]);
  }

  toArray(): string[] {
    return [...this.values];
  }
}
