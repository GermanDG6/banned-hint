import { Injectable, Inject } from '@nestjs/common';
import { LobbyRepository, LOBBY_REPOSITORY } from '../../domain/repositories/lobby.repository';
import { CardRepository, CARD_REPOSITORY } from '../../../card/domain/repositories/card.repository';
import { CardDto } from '../../../card/application/dtos/card.dto';
import { RoundSessionDto } from '../dtos/round-session.dto';
import { LobbyNotFoundException } from '../../domain/exceptions/lobby-not-found.exception';
import { CardNotFoundException } from '../../../card/domain/exceptions/card-not-found.exception';

export interface StartRoundInput {
  lobbyCode: string;
  playerId: string;
  durationSeconds: number;
}

@Injectable()
export class StartRoundUseCase {
  constructor(
    @Inject(LOBBY_REPOSITORY)
    private readonly lobbyRepository: LobbyRepository,
    @Inject(CARD_REPOSITORY)
    private readonly cardRepository: CardRepository,
  ) {}

  async execute(input: StartRoundInput): Promise<RoundSessionDto> {
    // Find the lobby
    const lobby = await this.lobbyRepository.findByCode(input.lobbyCode);
    if (!lobby) {
      throw new LobbyNotFoundException(`Lobby with code ${input.lobbyCode} not found`);
    }

    // Validate that the player is the describer
    lobby.validateDescriberOnly(input.playerId);

    // Get a random card
    const card = await this.cardRepository.findRandom();
    if (!card) {
      throw new CardNotFoundException('No cards available');
    }

    // Start the round in the lobby
    lobby.startRound(
      card.id.value,
      card.word.value,
      card.bannedWords.toArray(),
      input.durationSeconds,
    );

    // Persist the updated lobby
    await this.lobbyRepository.save(lobby);

    // Create and return the DTO with card data
    const cardDto = new CardDto(card.id.value, card.word.value, card.bannedWords.toArray());
    return new RoundSessionDto(lobby.getRoundSession()!, cardDto);
  }
}
