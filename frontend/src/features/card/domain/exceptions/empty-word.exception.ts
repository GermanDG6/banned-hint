export class EmptyWordException extends Error {
  constructor(message: string = 'Word cannot be empty') {
    super(message);
    this.name = 'EmptyWordException';
  }
}
