import { Injectable, Inject } from '@nestjs/common';
import { LobbyRepository, LOBBY_REPOSITORY } from '../../domain/repositories/lobby.repository';
import { LobbyNotFoundException } from '../../domain/exceptions/lobby-not-found.exception';

export interface EndRoundInput {
  lobbyCode: string;
  playerId: string;
}

@Injectable()
export class EndRoundUseCase {
  constructor(
    @Inject(LOBBY_REPOSITORY)
    private readonly lobbyRepository: LobbyRepository,
  ) {}

  async execute(input: EndRoundInput): Promise<void> {
    const lobby = await this.lobbyRepository.findByCode(input.lobbyCode);
    if (!lobby) {
      throw new LobbyNotFoundException(`Lobby with code ${input.lobbyCode} not found`);
    }

    lobby.validateDescriberOnly(input.playerId);

    lobby.endRound();

    await this.lobbyRepository.save(lobby);
  }
}
