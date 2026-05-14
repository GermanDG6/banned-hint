export class EmptyBannedWordsException extends Error {
  constructor(message: string = 'Banned words list cannot be empty') {
    super(message);
    this.name = 'EmptyBannedWordsException';
  }
}
