import { Module } from '@nestjs/common';
import { CardModule } from '../card/card.module';
import { LobbyController } from './interfaces/http/controllers/lobby.controller';
import { LobbyGateway } from './interfaces/ws/lobby.gateway';
import { CreateLobbyUseCase } from './application/use-cases/create-lobby.use-case';
import { JoinLobbyUseCase } from './application/use-cases/join-lobby.use-case';
import { StartRoundUseCase } from './application/use-cases/start-round.use-case';
import { NextCardUseCase } from './application/use-cases/next-card.use-case';
import { SubmitGuessUseCase } from './application/use-cases/submit-guess.use-case';
import { EndRoundUseCase } from './application/use-cases/end-round.use-case';
import { InMemoryLobbyRepository } from './infrastructure/persistence/in-memory-lobby.repository';
import { LOBBY_REPOSITORY } from './domain/repositories/lobby.repository';

@Module({
  imports: [CardModule],
  controllers: [LobbyController],
  providers: [
    LobbyGateway,
    CreateLobbyUseCase,
    JoinLobbyUseCase,
    StartRoundUseCase,
    NextCardUseCase,
    SubmitGuessUseCase,
    EndRoundUseCase,
    {
      provide: LOBBY_REPOSITORY,
      useClass: InMemoryLobbyRepository,
    },
  ],
})
export class LobbyModule {}
