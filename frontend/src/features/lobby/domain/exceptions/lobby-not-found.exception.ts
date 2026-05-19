export class LobbyNotFoundException extends Error {
  constructor(code: string) {
    super(`Lobby with code "${code}" not found`);
    this.name = 'LobbyNotFoundException';
  }
}
