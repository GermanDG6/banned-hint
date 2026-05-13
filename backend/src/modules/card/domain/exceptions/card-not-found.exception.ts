export class CardNotFoundException extends Error {
  constructor(message: string = 'Card not found') {
    super(message);
    this.name = 'CardNotFoundException';
  }
}
