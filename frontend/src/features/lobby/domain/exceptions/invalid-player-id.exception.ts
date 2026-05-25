export class InvalidPlayerIdException extends Error {
  constructor(id: unknown) {
    super(`Invalid Player ID: "${id}". ID must be a non-empty string.`);
    this.name = 'InvalidPlayerIdException';
  }
}
