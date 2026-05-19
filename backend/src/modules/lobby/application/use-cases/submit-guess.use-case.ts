import { Injectable, Inject } from '@nestjs/common';
import { LobbyRepository, LOBBY_REPOSITORY } from '../../domain/repositories/lobby.repository';
import { LobbyNotFoundException } from '../../domain/exceptions/lobby-not-found.exception';

export interface SubmitGuessInput {
  lobbyCode: string;
  word: string;
}

export interface SubmitGuessOutput {
  correct: boolean;
}

@Injectable()
export class SubmitGuessUseCase {
  constructor(
    @Inject(LOBBY_REPOSITORY)
    private readonly lobbyRepository: LobbyRepository,
  ) {}

  async execute(input: SubmitGuessInput): Promise<SubmitGuessOutput> {
    // Find the lobby
    const lobby = await this.lobbyRepository.findByCode(input.lobbyCode);
    if (!lobby) {
      throw new LobbyNotFoundException(`Lobby with code ${input.lobbyCode} not found`);
    }

    // Get the current round session
    const roundSession = lobby.getRoundSession();
    if (!roundSession) {
      throw new Error('No active round session');
    }

    // Normalize and compare: case-insensitive, trimmed
    const normalizedGuess = input.word.trim().toLowerCase();
    const normalizedWord = roundSession.word.trim().toLowerCase();

    const isCorrect = normalizedGuess === normalizedWord;

    return {
      correct: isCorrect,
    };
  }
}
