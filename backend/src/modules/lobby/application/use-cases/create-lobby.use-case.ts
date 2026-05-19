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
    // Generate a unique lobby code
    const lobbyCode = LobbyCode.generate();

    // Create the host player as describer
    const hostPlayer = Player.create('', input.playerName, PlayerRoleType.Describer);

    // Create the lobby with the host as the first player
    const lobby = Lobby.create(lobbyCode, hostPlayer);

    // Persist the lobby
    await this.lobbyRepository.save(lobby);

    // Return the response
    return new CreateLobbyResponseDto(lobbyCode.value, hostPlayer.id, 'describer');
  }
}
