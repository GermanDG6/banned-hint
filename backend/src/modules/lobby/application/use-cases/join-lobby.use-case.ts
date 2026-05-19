import { Injectable, Inject } from '@nestjs/common';
import { LobbyRepository, LOBBY_REPOSITORY } from '../../domain/repositories/lobby.repository';
import { LobbyCode } from '../../domain/value-objects/lobby-code.value-object';
import { Player } from '../../domain/entities/player.entity';
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
    // Validate the code format
    const lobbyCode = LobbyCode.from(input.code);

    // Find the lobby
    const lobby = await this.lobbyRepository.findByCode(lobbyCode.value);
    if (!lobby) {
      throw new LobbyNotFoundException(`Lobby with code ${input.code} not found`);
    }

    // Create a new guesser player
    // Note: socket.id will be assigned when the socket connects; here we use empty for now
    const guesserPlayer = Player.create('', input.playerName, 'guesser');

    // Add the player to the lobby
    lobby.join(guesserPlayer);

    // Persist the updated lobby
    await this.lobbyRepository.save(lobby);

    // Return the response
    return new JoinLobbyResponseDto(guesserPlayer.id, 'guesser');
  }
}
