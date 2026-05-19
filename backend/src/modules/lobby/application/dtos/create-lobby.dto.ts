export class CreateLobbyDto {
  playerName: string;
  durationSeconds: number;

  constructor(playerName: string, durationSeconds: number) {
    this.playerName = playerName;
    this.durationSeconds = durationSeconds;
  }
}
