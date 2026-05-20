export class JoinLobbyDto {
  code: string;
  playerName: string;
  playerId: string;

  constructor(code: string, playerName: string, playerId: string) {
    this.code = code;
    this.playerName = playerName;
    this.playerId = playerId;
  }
}
