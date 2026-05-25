import { Injectable, Inject } from '@nestjs/common';
import { LobbyRepository, LOBBY_REPOSITORY } from '../../domain/repositories/lobby.repository';
import { LobbyCode } from '../../domain/value-objects/lobby-code.value-object';
import { Player } from '../../domain/entities/player.entity';
import { PlayerRoleType } from '../../domain/value-objects/player-role.value-object';
import { Lobby } from '../../domain/entities/lobby.entity';
import { CreateLobbyDto } from '../dtos/create-lobby.dto';
import { CreateLobbyResponseDto } from '../dtos/create-lobby-response.dto';

@Injectable()
export class CreateLobbyUseCase {
  constructor(
    @Inject(LOBBY_REPOSITORY)
    private readonly lobbyRepository: LobbyRepository,
  ) {}

  async execute(input: CreateLobbyDto): Promise<CreateLobbyResponseDto> {
    const lobbyCode = LobbyCode.generate();

    const hostPlayer = Player.create(input.playerId, input.playerName, PlayerRoleType.Describer);

    const lobby = Lobby.create(lobbyCode, hostPlayer);

    await this.lobbyRepository.save(lobby);

    return new CreateLobbyResponseDto(lobbyCode.value, hostPlayer.id, hostPlayer.getRole());
  }
}
