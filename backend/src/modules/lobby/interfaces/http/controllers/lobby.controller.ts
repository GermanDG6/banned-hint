import { Controller, Post, Get, Body, Param, Inject } from '@nestjs/common';
import { CreateLobbyUseCase } from '../../../application/use-cases/create-lobby.use-case';
import { CreateLobbyDto } from '../../../application/dtos/create-lobby.dto';
import { CreateLobbyResponseDto } from '../../../application/dtos/create-lobby-response.dto';
import { LobbyRepository, LOBBY_REPOSITORY } from '../../../domain/repositories/lobby.repository';

@Controller('lobby')
export class LobbyController {
  constructor(
    private readonly createLobbyUseCase: CreateLobbyUseCase,
    @Inject(LOBBY_REPOSITORY)
    private readonly lobbyRepository: LobbyRepository,
  ) {}

  @Post()
  async createLobby(@Body() dto: CreateLobbyDto): Promise<CreateLobbyResponseDto> {
    return this.createLobbyUseCase.execute(dto);
  }

  @Get(':code')
  async getLobby(@Param('code') code: string) {
    const lobby = await this.lobbyRepository.findByCode(code);
    if (!lobby) {
      throw new Error('Lobby not found');
    }
    return {
      code: lobby.code.value,
      status: lobby.getStatus(),
      players: lobby.getPlayers().map((p) => ({
        id: p.id,
        name: p.name,
        role: p.isDescriber() ? 'describer' : 'guesser',
      })),
    };
  }
}
