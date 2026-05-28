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
import { EndRoundUseCase } from '../../application/use-cases/end-round.use-case';
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
    private readonly endRoundUseCase: EndRoundUseCase,
    @Inject(LOBBY_REPOSITORY)
    private readonly lobbyRepository: LobbyRepository,
  ) {}

  @SubscribeMessage('join-lobby')
  async handleJoinLobby(
    client: Socket,
    payload: { code: string; playerName: string; role: 'describer' | 'guesser'; playerId: string },
  ) {
    try {
      const { code, playerName, role, playerId } = payload;
      let connectedPlayerId: string;
      let lobby = await this.lobbyRepository.findByCode(code);

      if (!lobby) {
        client.emit('error', { message: 'Lobby not found' });
        return;
      }

      if (role === 'describer') {
        // NOTE: MVP limitation - no authentication; any client can claim the describer role
        lobby.assignDescriberId(playerId);
        await this.lobbyRepository.save(lobby);
        connectedPlayerId = playerId;
      } else {
        const existingGuesser = playerId ? lobby.findGuesserById(playerId) : undefined;
        if (existingGuesser) {
          connectedPlayerId = existingGuesser.id;
        } else {
          const result = await this.joinLobbyUseCase.execute({
            code,
            playerName,
            playerId,
          });
          connectedPlayerId = result.playerId;
        }
      }

      client.join(code);

      this.socketMap.set(client.id, { lobbyCode: code, playerId: connectedPlayerId });

      // Emit lobby-updated event to the entire room
      lobby = await this.lobbyRepository.findByCode(code);
      this.server.to(code).emit('lobby-updated', {
        players: lobby!.getPlayers().map((p) => ({
          id: p.id,
          name: p.name,
          role: p.isDescriber() ? 'describer' : 'guesser',
        })),
      });

      // Emit round-started to reconnecting client if round is active
      const activeSession = lobby!.getRoundSession();
      if (activeSession) {
        const isDescriber = role === 'describer';
        const roundStartedPayload: {
          startAt: number;
          durationSeconds: number;
          card?: { id: string; word: string; bannedWords: string[] };
        } = {
          startAt: activeSession.startAt,
          durationSeconds: activeSession.durationSeconds,
        };
        if (isDescriber) {
          roundStartedPayload.card = {
            id: activeSession.cardId,
            word: activeSession.word,
            bannedWords: activeSession.bannedWords,
          };
        }
        client.emit('round-started', roundStartedPayload);
      }
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

      client.emit('round-started', {
        startAt: result.startAt,
        durationSeconds: result.durationSeconds,
        card: result.card,
      });

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

      client.emit('card-changed', {
        startAt: result.startAt,
        durationSeconds: result.durationSeconds,
        card: result.card,
      });

      client.to(context.lobbyCode).emit('card-changed', {
        startAt: result.startAt,
        durationSeconds: result.durationSeconds,
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
        playerId: context.playerId,
        word: payload.word,
      });

      if (result.correct) {
        // Emit word-guessed to the entire room
        this.server.to(context.lobbyCode).emit('word-guessed', {
          playerName: result.playerName,
          word: payload.word,
        });

        // Then emit round-ended to the entire room
        this.server.to(context.lobbyCode).emit('round-ended', {});
      } else {
        // Only incorrect attempts emit guess-result to the guesser
        client.emit('guess-result', {
          correct: result.correct,
        });
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('end-round')
  async handleEndRound(client: Socket) {
    try {
      const context = this.socketMap.get(client.id);
      if (!context) {
        client.emit('error', { message: 'Socket not registered' });
        return;
      }

      await this.endRoundUseCase.execute({
        lobbyCode: context.lobbyCode,
        playerId: context.playerId,
      });

      this.server.to(context.lobbyCode).emit('round-ended', {});
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  handleDisconnect(client: Socket) {
    this.socketMap.delete(client.id);
  }
}
