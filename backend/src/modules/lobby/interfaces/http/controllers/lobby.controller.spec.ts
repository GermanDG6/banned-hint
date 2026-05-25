import { Test, TestingModule } from '@nestjs/testing';
import { LobbyController } from './lobby.controller';
import { CreateLobbyUseCase } from '../../../application/use-cases/create-lobby.use-case';
import { LOBBY_REPOSITORY } from '../../../domain/repositories/lobby.repository';
import { CreateLobbyDto } from '../../../application/dtos/create-lobby.dto';
import { LobbyNotFoundException } from '../../../domain/exceptions/lobby-not-found.exception';

describe('LobbyController', () => {
  let controller: LobbyController;
  let createLobbyUseCase: CreateLobbyUseCase;
  let lobbyRepository;

  beforeEach(async () => {
    const mockCreateLobbyUseCase = {
      execute: jest.fn(),
    };

    const mockLobbyRepository = {
      findByCode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LobbyController],
      providers: [
        {
          provide: CreateLobbyUseCase,
          useValue: mockCreateLobbyUseCase,
        },
        {
          provide: LOBBY_REPOSITORY,
          useValue: mockLobbyRepository,
        },
      ],
    }).compile();

    controller = module.get<LobbyController>(LobbyController);
    createLobbyUseCase = module.get<CreateLobbyUseCase>(CreateLobbyUseCase);
    lobbyRepository = module.get(LOBBY_REPOSITORY);
  });

  describe('createLobby', () => {
    it('should create a lobby and return the response', async () => {
      const dto: CreateLobbyDto = {
        playerName: 'John Doe',
        playerId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const response = {
        code: 'ABC123',
        playerId: '550e8400-e29b-41d4-a716-446655440000',
        role: 'describer',
      };

      (createLobbyUseCase.execute as jest.Mock).mockResolvedValue(response);

      const result = await controller.createLobby(dto);

      expect(result).toEqual(response);
      expect(createLobbyUseCase.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('getLobby', () => {
    it('should return lobby details when lobby exists', async () => {
      const mockLobby = {
        code: { value: 'ABC123' },
        getStatus: jest.fn().mockReturnValue('waiting'),
        getPlayers: jest.fn().mockReturnValue([
          {
            id: 'player-1',
            name: 'John Doe',
            getRole: jest.fn().mockReturnValue('describer'),
          },
          {
            id: 'player-2',
            name: 'Jane Doe',
            getRole: jest.fn().mockReturnValue('guesser'),
          },
        ]),
      };

      (lobbyRepository.findByCode as jest.Mock).mockResolvedValue(mockLobby);

      const result = await controller.getLobby('ABC123');

      expect(result).toEqual({
        code: 'ABC123',
        status: 'waiting',
        players: [
          {
            id: 'player-1',
            name: 'John Doe',
            role: 'describer',
          },
          {
            id: 'player-2',
            name: 'Jane Doe',
            role: 'guesser',
          },
        ],
      });
      expect(lobbyRepository.findByCode).toHaveBeenCalledWith('ABC123');
    });

    it('should throw LobbyNotFoundException when lobby does not exist', async () => {
      (lobbyRepository.findByCode as jest.Mock).mockResolvedValue(null);

      await expect(controller.getLobby('INVALID')).rejects.toThrow(LobbyNotFoundException);
    });
  });
});
