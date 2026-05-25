export class InvalidPlayerNameException extends Error {
  constructor(name: unknown) {
    super(`Invalid Player name: "${name}". Name must be a non-empty string.`);
    this.name = 'InvalidPlayerNameException';
  }
}
