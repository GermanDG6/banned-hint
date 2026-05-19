export class JoinLobbyResponseDto {
  playerId: string;
  role: string;

  constructor(playerId: string, role: string) {
    this.playerId = playerId;
    this.role = role;
  }
}
