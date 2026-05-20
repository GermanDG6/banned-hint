import { Injectable, Inject } from '@nestjs/common';
import { LobbyRepository, LOBBY_REPOSITORY } from '../../domain/repositories/lobby.repository';
import { LobbyCode } from '../../domain/value-objects/lobby-code.value-object';
import { Player } from '../../domain/entities/player.entity';
import { PlayerRoleType } from '../../domain/value-objects/player-role.value-object';
import { JoinLobbyDto } from '../dtos/join-lobby.dto';
import { JoinLobbyResponseDto } from '../dtos/join-lobby-response.dto';
import { LobbyNotFoundException } from '../../domain/exceptions/lobby-not-found.exception';

@Injectable()
export class JoinLobbyUseCase {
  constructor(
    @Inject(LOBBY_REPOSITORY)
    private readonly lobbyRepository: LobbyRepository,
  ) {}

  async execute(input: JoinLobbyDto): Promise<JoinLobbyResponseDto> {
    const lobbyCode = LobbyCode.from(input.code);

    const lobby = await this.lobbyRepository.findByCode(lobbyCode.value);
    if (!lobby) {
      throw new LobbyNotFoundException(`Lobby with code ${input.code} not found`);
    }

    const guesserPlayer = Player.create(input.playerId, input.playerName, PlayerRoleType.Guesser);

    lobby.join(guesserPlayer);

    await this.lobbyRepository.save(lobby);

    return new JoinLobbyResponseDto(guesserPlayer.id, 'guesser');
  }
}
