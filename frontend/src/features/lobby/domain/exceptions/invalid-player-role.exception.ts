export class InvalidPlayerRoleException extends Error {
  constructor(role: unknown) {
    super(`Invalid Player role: "${role}". Role must be 'describer' or 'guesser'.`);
    this.name = 'InvalidPlayerRoleException';
  }
}
