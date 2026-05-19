export class CreateLobbyResponseDto {
  code: string;
  playerId: string;
  role: string;

  constructor(code: string, playerId: string, role: string) {
    this.code = code;
    this.playerId = playerId;
    this.role = role;
  }
}
