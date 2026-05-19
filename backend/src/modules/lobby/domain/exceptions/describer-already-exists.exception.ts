export class DescriberAlreadyExistsException extends Error {
  constructor(message: string = 'A describer already exists in this lobby') {
    super(message);
    this.name = 'DescriberAlreadyExistsException';
  }
}
