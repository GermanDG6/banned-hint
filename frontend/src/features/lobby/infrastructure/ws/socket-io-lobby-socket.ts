import { io, Socket } from 'socket.io-client';
import { LobbySocket } from '../../application/ports/lobby-socket.port';
import { Player, PlayerRole } from '@/features/lobby/domain/models/player.model.ts';
import { RoundSession } from '@/features/lobby/domain/models/round-session.model.ts';

/**
 * SocketIOLobbySocket: implementa LobbySocket usando socket.io-client
 */
export class SocketIOLobbySocket implements LobbySocket {
  private socket: Socket | null = null;
  private readonly serverUrl = 'http://localhost:3000';

  connect(): void {
    if (this.socket) {
      return; // Ya conectado
    }

    this.socket = io(this.serverUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinLobby(code: string, playerName: string, role: PlayerRole, playerId?: string): void {
    if (!this.socket) {
      throw new Error('Socket not connected. Call connect() first.');
    }
    this.socket.emit('join-lobby', {
      code,
      playerName,
      role,
      ...(playerId && { playerId }),
    });
  }

  startRound(durationSeconds: number): void {
    if (!this.socket) {
      throw new Error('Socket not connected. Call connect() first.');
    }
    this.socket.emit('start-round', {
      durationSeconds,
    });
  }

  nextCard(): void {
    if (!this.socket) {
      throw new Error('Socket not connected. Call connect() first.');
    }
    this.socket.emit('next-card', {});
  }

  submitGuess(word: string): void {
    if (!this.socket) {
      throw new Error('Socket not connected. Call connect() first.');
    }
    this.socket.emit('submit-guess', {
      word,
    });
  }

  onConnect(handler: () => void): () => void {
    if (!this.socket) {
      throw new Error('Socket not connected. Call connect() first.');
    }
    this.socket.on('connect', handler);
    return () => this.socket?.off('connect', handler);
  }

  onLobbyUpdated(handler: (players: Player[]) => void): () => void {
    if (!this.socket) {
      throw new Error('Socket not connected. Call connect() first.');
    }
    const wrappedHandler = (data: { players: Player[] }) => {
      handler(data.players);
    };
    this.socket.on('lobby-updated', wrappedHandler);
    return () => this.socket?.off('lobby-updated', wrappedHandler);
  }

  onRoundStarted(handler: (session: RoundSession) => void): () => void {
    if (!this.socket) {
      throw new Error('Socket not connected. Call connect() first.');
    }
    this.socket.on('round-started', handler);
    return () => this.socket?.off('round-started', handler);
  }

  onCardChanged(handler: (session: RoundSession) => void): () => void {
    if (!this.socket) {
      throw new Error('Socket not connected. Call connect() first.');
    }
    this.socket.on('card-changed', handler);
    return () => this.socket?.off('card-changed', handler);
  }

  onGuessResult(handler: (result: { correct: boolean }) => void): () => void {
    if (!this.socket) {
      throw new Error('Socket not connected. Call connect() first.');
    }
    this.socket.on('guess-result', handler);
    return () => this.socket?.off('guess-result', handler);
  }

  onError(handler: (error: { message: string }) => void): () => void {
    if (!this.socket) {
      throw new Error('Socket not connected. Call connect() first.');
    }
    this.socket.on('error', handler);
    return () => this.socket?.off('error', handler);
  }
}
