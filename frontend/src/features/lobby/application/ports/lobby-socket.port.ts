import { Player, PlayerRole } from '@/features/lobby/domain/models/player.model.ts';
import { RoundSession } from '@/features/lobby/domain/models/round-session.model.ts';

export interface LobbySocket {
  connect(): void;

  disconnect(): void;

  joinLobby(code: string, playerName: string, role: PlayerRole): void;

  startRound(durationSeconds: number): void;

  nextCard(): void;

  submitGuess(word: string): void;

  /**
   * Registra un handler que se dispara cuando el socket se conecta.
   * Devuelve una función de cleanup que desuscribe el handler.
   */
  onConnect(handler: () => void): () => void;

  /**
   * Registra un handler para el evento 'lobby-updated'.
   * Devuelve una función de cleanup que desuscribe el handler.
   */
  onLobbyUpdated(handler: (players: Player[]) => void): () => void;

  /**
   * Registra un handler para el evento 'round-started'.
   * Devuelve una función de cleanup que desuscribe el handler.
   */
  onRoundStarted(handler: (session: RoundSession) => void): () => void;

  /**
   * Registra un handler para el evento 'card-changed'.
   * Devuelve una función de cleanup que desuscribe el handler.
   */
  onCardChanged(handler: (session: RoundSession) => void): () => void;

  /**
   * Registra un handler para el evento 'guess-result'.
   * Devuelve una función de cleanup que desuscribe el handler.
   */
  onGuessResult(handler: (result: { correct: boolean }) => void): () => void;

  /**
   * Registra un handler para el evento 'error'.
   * Devuelve una función de cleanup que desuscribe el handler.
   */
  onError(handler: (error: { message: string }) => void): () => void;
}
