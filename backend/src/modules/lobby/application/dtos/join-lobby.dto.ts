export class JoinLobbyDto {
  code: string;
  playerName: string;

  constructor(code: string, playerName: string) {
    this.code = code;
    this.playerName = playerName;
  }
}
