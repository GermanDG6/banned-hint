export class InsufficientBannedWordsException extends Error {
  constructor(message: string = 'At least 4 banned words are required') {
    super(message);
    this.name = 'InsufficientBannedWordsException';
  }
}
