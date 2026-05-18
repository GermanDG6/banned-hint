import { InvalidTimerException } from '../exceptions/invalid-timer.exception';

export class Timer {
  readonly minutes: number;
  readonly seconds: number;

  private constructor(minutes: number, seconds: number) {
    this.minutes = minutes;
    this.seconds = seconds;
  }

  static create(minutes: number, seconds: number): Timer {
    if (minutes < 0 || seconds < 0 || seconds > 59) {
      throw new InvalidTimerException();
    }

    return new Timer(minutes, seconds);
  }

  toSeconds(): number {
    return this.minutes * 60 + this.seconds;
  }

  equals(other: Timer): boolean {
    return this.minutes === other.minutes && this.seconds === other.seconds;
  }

  toString(): string {
    return `${String(this.minutes).padStart(2, '0')}:${String(this.seconds).padStart(2, '0')}`;
  }
}
