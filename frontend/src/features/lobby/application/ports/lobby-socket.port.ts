import { Player, PlayerRole } from '@/features/lobby/domain/models/player.model.ts';
import { RoundSession } from '@/features/lobby/domain/models/round-session.model.ts';

export interface LobbySocket {
  connect(): void;

  disconnect(): void;

  joinLobby(code: string, playerName: string, role: PlayerRole, playerId?: string): void;

  startRound(durationSeconds: number): void;

  nextCard(): void;

  submitGuess(word: string): void;

  onConnect(handler: () => void): () => void;

  onLobbyUpdated(handler: (players: Player[]) => void): () => void;

  onRoundStarted(handler: (session: RoundSession) => void): () => void;

  onCardChanged(handler: (session: RoundSession) => void): () => void;

  onGuessResult(handler: (result: { correct: boolean }) => void): () => void;

  onError(handler: (error: { message: string }) => void): () => void;

  onRoundEnded(handler: () => void): () => void;

  endRound(): void;
}
