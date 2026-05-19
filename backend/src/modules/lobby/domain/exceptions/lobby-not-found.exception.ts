export class LobbyNotFoundException extends Error {
  constructor(message: string = 'Lobby not found') {
    super(message);
    this.name = 'LobbyNotFoundException';
  }
}
