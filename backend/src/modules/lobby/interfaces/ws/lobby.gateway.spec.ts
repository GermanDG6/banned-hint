import { Test, TestingModule } from '@nestjs/testing';
import { LobbyGateway } from './lobby.gateway';
import { CreateLobbyUseCase } from '../../application/use-cases/create-lobby.use-case';
import { JoinLobbyUseCase } from '../../application/use-cases/join-lobby.use-case';
import { StartRoundUseCase } from '../../application/use-cases/start-round.use-case';
import { NextCardUseCase } from '../../application/use-cases/next-card.use-case';
import { SubmitGuessUseCase } from '../../application/use-cases/submit-guess.use-case';
import { LOBBY_REPOSITORY } from '../../domain/repositories/lobby.repository';

describe('LobbyGateway', () => {
  let gateway: LobbyGateway;
  let mockCreateLobby;
  let mockJoinLobby;
  let mockStartRound;
  let mockNextCard;
  let mockSubmitGuess;
  let mockLobbyRepository;
  let mockSocket;
  let mockServer;

  beforeEach(async () => {
    mockCreateLobby = {
      execute: jest.fn(),
    };

    mockJoinLobby = {
      execute: jest.fn(),
    };

    mockStartRound = {
      execute: jest.fn(),
    };

    mockNextCard = {
      execute: jest.fn(),
    };

    mockSubmitGuess = {
      execute: jest.fn(),
    };

    mockLobbyRepository = {
      findByCode: jest.fn(),
      save: jest.fn(),
    };

    mockSocket = {
      id: 'socket-1',
      emit: jest.fn(),
      join: jest.fn(),
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    };

    mockServer = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LobbyGateway,
        {
          provide: CreateLobbyUseCase,
          useValue: mockCreateLobby,
        },
        {
          provide: JoinLobbyUseCase,
          useValue: mockJoinLobby,
        },
        {
          provide: StartRoundUseCase,
          useValue: mockStartRound,
        },
        {
          provide: NextCardUseCase,
          useValue: mockNextCard,
        },
        {
          provide: SubmitGuessUseCase,
          useValue: mockSubmitGuess,
        },
        {
          provide: LOBBY_REPOSITORY,
          useValue: mockLobbyRepository,
        },
      ],
    }).compile();

    gateway = module.get<LobbyGateway>(LobbyGateway);
    gateway.server = mockServer;
  });

  describe('handleJoinLobby', () => {
    it('should assign describer socket ID when role is describer', async () => {
      const mockLobby = {
        assignDescriberId: jest.fn(),
        getPlayers: jest
          .fn()
          .mockReturnValue([
            { id: 'socket-1', name: 'John', isDescriber: jest.fn().mockReturnValue(true) },
          ]),
      };

      mockLobbyRepository.findByCode.mockResolvedValue(mockLobby);

      await gateway.handleJoinLobby(mockSocket, {
        code: 'ABC123',
        playerName: 'John',
        role: 'describer',
      });

      expect(mockLobby.assignDescriberId).toHaveBeenCalledWith('socket-1');
      expect(mockLobbyRepository.save).toHaveBeenCalledWith(mockLobby);
      expect(mockSocket.join).toHaveBeenCalledWith('ABC123');
    });

    it('should join guesser using use-case when role is guesser and player is new', async () => {
      const mockLobby = {
        findGuesserById: jest.fn().mockReturnValue(undefined), // Player does not exist yet
        getPlayers: jest.fn().mockReturnValue([
          { id: 'socket-1', name: 'John', isDescriber: jest.fn().mockReturnValue(true) },
          { id: 'player-2', name: 'Jane', isDescriber: jest.fn().mockReturnValue(false) },
        ]),
      };

      mockJoinLobby.execute.mockResolvedValue({ playerId: 'player-2', role: 'guesser' });
      mockLobbyRepository.findByCode.mockResolvedValue(mockLobby);

      await gateway.handleJoinLobby(mockSocket, {
        code: 'ABC123',
        playerName: 'Jane',
        role: 'guesser',
        playerId: 'player-2',
      });

      expect(mockLobby.findGuesserById).toHaveBeenCalledWith('player-2');
      expect(mockJoinLobby.execute).toHaveBeenCalledWith({
        code: 'ABC123',
        playerName: 'Jane',
        playerId: 'player-2',
      });
      expect(mockSocket.join).toHaveBeenCalledWith('ABC123');
    });

    it('should not call use-case when guesser already exists (reconnect)', async () => {
      const mockLobby = {
        findGuesserById: jest
          .fn()
          .mockReturnValue({ id: 'player-2', name: 'Jane', isDescriber: () => false }),
        getPlayers: jest.fn().mockReturnValue([
          { id: 'socket-1', name: 'John', isDescriber: jest.fn().mockReturnValue(true) },
          { id: 'player-2', name: 'Jane', isDescriber: jest.fn().mockReturnValue(false) },
        ]),
      };

      mockLobbyRepository.findByCode.mockResolvedValue(mockLobby);

      await gateway.handleJoinLobby(mockSocket, {
        code: 'ABC123',
        playerName: 'Jane',
        role: 'guesser',
        playerId: 'player-2',
      });

      expect(mockLobby.findGuesserById).toHaveBeenCalledWith('player-2');
      expect(mockJoinLobby.execute).not.toHaveBeenCalled();
      expect(mockSocket.join).toHaveBeenCalledWith('ABC123');
    });

    it('should emit error when lobby not found for describer', async () => {
      mockLobbyRepository.findByCode.mockResolvedValue(null);

      await gateway.handleJoinLobby(mockSocket, {
        code: 'INVALID',
        playerName: 'John',
        role: 'describer',
      });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          message: expect.any(String),
        }),
      );
    });
  });

  describe('handleStartRound', () => {
    it('should emit round-started with card to describer and without card to others', async () => {
      const result = {
        startAt: Date.now(),
        durationSeconds: 60,
        card: { id: 'card-1', word: 'test', bannedWords: ['a', 'b'] },
      };

      mockStartRound.execute.mockResolvedValue(result);

      // Manually set socket context
      (gateway as any).socketMap.set('socket-1', {
        lobbyCode: 'ABC123',
        playerId: 'player-1',
      });

      await gateway.handleStartRound(mockSocket, { durationSeconds: 60 });

      // Check describer receives card
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'round-started',
        expect.objectContaining({
          startAt: result.startAt,
          card: result.card,
        }),
      );

      // Check others receive without card
      expect(mockSocket.to).toHaveBeenCalledWith('ABC123');
    });

    it('should emit error when socket not registered', async () => {
      await gateway.handleStartRound(mockSocket, { durationSeconds: 60 });

      expect(mockSocket.emit).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          message: 'Socket not registered',
        }),
      );
    });
  });

  describe('handleSubmitGuess', () => {
    it('should emit guess-result only to the guesser', async () => {
      mockSubmitGuess.execute.mockResolvedValue({ correct: true });

      // Manually set socket context
      (gateway as any).socketMap.set('socket-1', {
        lobbyCode: 'ABC123',
        playerId: 'player-2',
      });

      await gateway.handleSubmitGuess(mockSocket, { word: 'test' });

      expect(mockSocket.emit).toHaveBeenCalledWith('guess-result', { correct: true });
      expect(mockSubmitGuess.execute).toHaveBeenCalledWith({
        lobbyCode: 'ABC123',
        word: 'test',
      });
    });
  });

  describe('handleDisconnect', () => {
    it('should remove socket from map on disconnect', () => {
      // Manually set socket context
      (gateway as any).socketMap.set('socket-1', {
        lobbyCode: 'ABC123',
        playerId: 'player-1',
      });

      gateway.handleDisconnect(mockSocket);

      expect((gateway as any).socketMap.has('socket-1')).toBe(false);
    });
  });
});
