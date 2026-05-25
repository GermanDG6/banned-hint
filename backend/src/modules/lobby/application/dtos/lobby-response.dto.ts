import { Lobby } from '../../domain/entities/lobby.entity';

export class PlayerResponseDto {
  id: string;
  name: string;
  role: string;

  constructor(id: string, name: string, role: string) {
    this.id = id;
    this.name = name;
    this.role = role;
  }
}

export class LobbyResponseDto {
  code: string;
  status: string;
  players: PlayerResponseDto[];

  constructor(code: string, status: string, players: PlayerResponseDto[]) {
    this.code = code;
    this.status = status;
    this.players = players;
  }

  static fromEntity(lobby: Lobby): LobbyResponseDto {
    const players = lobby.getPlayers().map((p) => new PlayerResponseDto(p.id, p.name, p.getRole()));
    return new LobbyResponseDto(lobby.code.value, lobby.getStatus(), players);
  }
}
