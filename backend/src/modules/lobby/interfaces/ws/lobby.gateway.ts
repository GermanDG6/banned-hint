import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { CreateLobbyUseCase } from '../../application/use-cases/create-lobby.use-case';
import { JoinLobbyUseCase } from '../../application/use-cases/join-lobby.use-case';
import { StartRoundUseCase } from '../../application/use-cases/start-round.use-case';
import { NextCardUseCase } from '../../application/use-cases/next-card.use-case';
import { SubmitGuessUseCase } from '../../application/use-cases/submit-guess.use-case';
import { LobbyRepository, LOBBY_REPOSITORY } from '../../domain/repositories/lobby.repository';

interface SocketContext {
  lobbyCode: string;
  playerId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class LobbyGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private socketMap: Map<string, SocketContext> = new Map();

  constructor(
    private readonly createLobbyUseCase: CreateLobbyUseCase,
    private readonly joinLobbyUseCase: JoinLobbyUseCase,
    private readonly startRoundUseCase: StartRoundUseCase,
    private readonly nextCardUseCase: NextCardUseCase,
    private readonly submitGuessUseCase: SubmitGuessUseCase,
    @Inject(LOBBY_REPOSITORY)
    private readonly lobbyRepository: LobbyRepository,
  ) {}

  @SubscribeMessage('join-lobby')
  async handleJoinLobby(
    client: Socket,
    payload: { code: string; playerName: string; role: 'describer' | 'guesser' },
  ) {
    try {
      const { code, playerName, role } = payload;

      let playerId: string;

      if (role === 'describer') {
        // For describer: fetch the existing lobby and assign the socket ID
        const lobby = await this.lobbyRepository.findByCode(code);
        if (!lobby) {
          client.emit('error', { message: 'Lobby not found' });
          return;
        }

        // Update the describer's socket ID
        // NOTE: MVP limitation - no authentication; any client can claim the describer role
        lobby.assignDescriberId(client.id);
        await this.lobbyRepository.save(lobby);

        playerId = client.id;
      } else {
        // For guesser: use the join-lobby use-case
        const result = await this.joinLobbyUseCase.execute({
          code,
          playerName,
        });
        playerId = result.playerId;
      }

      // Join the socket to the room
      client.join(code);

      // Store the socket context
      this.socketMap.set(client.id, { lobbyCode: code, playerId });

      // Emit lobby-updated event to the entire room
      const lobby = await this.lobbyRepository.findByCode(code);
      this.server.to(code).emit('lobby-updated', {
        players: lobby!.getPlayers().map((p) => ({
          id: p.id,
          name: p.name,
          role: p.isDescriber() ? 'describer' : 'guesser',
        })),
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('start-round')
  async handleStartRound(client: Socket, payload: { durationSeconds: number }) {
    try {
      const context = this.socketMap.get(client.id);
      if (!context) {
        client.emit('error', { message: 'Socket not registered' });
        return;
      }

      const result = await this.startRoundUseCase.execute({
        lobbyCode: context.lobbyCode,
        playerId: context.playerId,
        durationSeconds: payload.durationSeconds,
      });

      // Emit to describer with card data
      client.emit('round-started', {
        startAt: result.startAt,
        durationSeconds: result.durationSeconds,
        card: result.card,
      });

      // Emit to guessers without card data
      client.to(context.lobbyCode).emit('round-started', {
        startAt: result.startAt,
        durationSeconds: result.durationSeconds,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('next-card')
  async handleNextCard(client: Socket) {
    try {
      const context = this.socketMap.get(client.id);
      if (!context) {
        client.emit('error', { message: 'Socket not registered' });
        return;
      }

      const result = await this.nextCardUseCase.execute({
        lobbyCode: context.lobbyCode,
        playerId: context.playerId,
      });

      // Emit to describer with card data
      client.emit('card-changed', {
        startAt: result.startAt,
        card: result.card,
      });

      // Emit to guessers without card data
      client.to(context.lobbyCode).emit('card-changed', {
        startAt: result.startAt,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('submit-guess')
  async handleSubmitGuess(client: Socket, payload: { word: string }) {
    try {
      const context = this.socketMap.get(client.id);
      if (!context) {
        client.emit('error', { message: 'Socket not registered' });
        return;
      }

      const result = await this.submitGuessUseCase.execute({
        lobbyCode: context.lobbyCode,
        word: payload.word,
      });

      // Emit result only to the guesser who submitted
      client.emit('guess-result', {
        correct: result.correct,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  handleDisconnect(client: Socket) {
    // Clean up: remove the socket from the map
    // Note: the Player remains in the Lobby aggregate (MVP limitation)
    // In a future version with persistence, we might want to remove players after a timeout
    this.socketMap.delete(client.id);
  }
}
