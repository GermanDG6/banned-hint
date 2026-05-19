export class OnlyDescriberCanException extends Error {
  constructor(message: string = 'Only the describer can perform this action') {
    super(message);
    this.name = 'OnlyDescriberCanException';
  }
}
