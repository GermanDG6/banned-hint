export class CreateLobbyDto {
  playerName: string;
  playerId: string;

  constructor(playerName: string, playerId: string) {
    this.playerName = playerName;
    this.playerId = playerId;
  }
}
