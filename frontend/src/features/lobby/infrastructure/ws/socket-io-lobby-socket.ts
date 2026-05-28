import { io, Socket } from 'socket.io-client';
import { LobbySocket } from '../../application/ports/lobby-socket.port';
import { Player } from '@/features/lobby/domain/entities/player.entity';
import { PlayerRole } from '@/features/lobby/domain/models/player.model.ts';
import { RoundSession } from '@/features/lobby/domain/models/round-session.model.ts';

type PendingListener = {
  event: string;
  handler: (...args: unknown[]) => void;
};

export class SocketIOLobbySocket implements LobbySocket {
  private socket: Socket | null = null;
  private readonly serverUrl = 'http://localhost:3000';
  private pendingListeners: PendingListener[] = [];

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

    // Registrar todos los listeners pendientes en el socket real
    for (const { event, handler } of this.pendingListeners) {
      this.socket.on(event, handler);
    }
    this.pendingListeners = [];
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private registerListener<T extends unknown[]>(
    event: string,
    handler: (...args: T) => void,
  ): () => void {
    const untypedHandler = handler as (...args: unknown[]) => void;
    if (this.socket) {
      // Socket ya conectado: registrar directamente
      this.socket.on(event, untypedHandler);
      return () => this.socket?.off(event, untypedHandler);
    }

    // Socket no conectado: almacenar en buffer
    this.pendingListeners.push({ event, handler: untypedHandler });
    return () => {
      // Limpiar del buffer y del socket si se conectó entre registrar y limpiar
      this.pendingListeners = this.pendingListeners.filter(
        (l) => l.handler !== untypedHandler || l.event !== event,
      );
      this.socket?.off(event, untypedHandler);
    };
  }

  joinLobby(code: string, playerName: string, role: PlayerRole, playerId?: string): void {
    if (!this.socket) {
      throw new Error('Socket not connected. Call connect() first.');
    }
    this.socket.emit('join-lobby', {
      code,
      playerName,
      role,
      playerId,
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
    return this.registerListener('connect', handler);
  }

  onLobbyUpdated(handler: (players: Player[]) => void): () => void {
    const wrappedHandler = (data: { players: { id: string; name: string; role: string }[] }) => {
      try {
        const players = (data.players || []).map((playerData) =>
          Player.create(playerData.name, playerData.role, playerData.id),
        );
        handler(players);
      } catch (error) {
        console.error('Error parsing players from server:', error);
      }
    };
    return this.registerListener('lobby-updated', wrappedHandler);
  } // TODO revisar si wrappedHandler es necesario

  onRoundStarted(handler: (session: RoundSession) => void): () => void {
    return this.registerListener('round-started', handler);
  }

  onCardChanged(handler: (session: RoundSession) => void): () => void {
    return this.registerListener('card-changed', handler);
  }

  onGuessResult(handler: (result: { correct: boolean }) => void): () => void {
    return this.registerListener('guess-result', handler);
  }

  onWordGuessed(handler: (data: { playerName: string; word: string }) => void): () => void {
    return this.registerListener('word-guessed', handler);
  }

  onError(handler: (error: { message: string }) => void): () => void {
    return this.registerListener('error', handler);
  }

  onRoundEnded(handler: () => void): () => void {
    return this.registerListener('round-ended', handler);
  }

  endRound(): void {
    if (!this.socket) {
      throw new Error('Socket not connected. Call connect() first.');
    }
    this.socket.emit('end-round', {});
  }
}
