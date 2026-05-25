interface PlayerDto {
  id: string;
  name: string;
  role: string;
}

export class CreateLobbyDto {
  player: PlayerDto;
  durationSeconds: number;

  constructor(player: PlayerDto, durationSeconds: number) {
    this.player = player;
    this.durationSeconds = durationSeconds;
  }
}
