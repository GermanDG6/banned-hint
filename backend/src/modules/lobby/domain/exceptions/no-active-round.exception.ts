export class NoActiveRoundException extends Error {
  constructor(message: string = 'No active round in this lobby') {
    super(message);
    this.name = 'NoActiveRoundException';
  }
}
