export class InvalidTimerException extends Error {
  constructor(
    message: string = 'Timer values must be valid: minutes >= 0 and seconds between 0 and 59',
  ) {
    super(message);
    this.name = 'InvalidTimerException';
  }
}
