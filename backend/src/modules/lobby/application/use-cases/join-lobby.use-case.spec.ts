import { JoinLobbyUseCase } from './join-lobby.use-case';
import { LobbyRepository } from '../../domain/repositories/lobby.repository';
import { Lobby } from '../../domain/entities/lobby.entity';
import { Player } from '../../domain/entities/player.entity';
import { LobbyCode } from '../../domain/value-objects/lobby-code.value-object';
import { JoinLobbyDto } from '../dtos/join-lobby.dto';
import { LobbyNotFoundException } from '../../domain/exceptions/lobby-not-found.exception';

describe('JoinLobbyUseCase', () => {
  let useCase: JoinLobbyUseCase;
  let lobbyRepositoryMock: jest.Mocked<LobbyRepository>;

  beforeEach(() => {
    lobbyRepositoryMock = {
      save: jest.fn(),
      findByCode: jest.fn(),
    };
    useCase = new JoinLobbyUseCase(lobbyRepositoryMock);
  });

  it('should add a guesser player to an existing lobby', async () => {
    const code = LobbyCode.from('TEST01');
    const describer = Player.create('socket-1', 'Alice', 'describer');
    const lobby = Lobby.create(code, describer);

    lobbyRepositoryMock.findByCode.mockResolvedValue(lobby);

    const input = new JoinLobbyDto('TEST01', 'Bob');
    const result = await useCase.execute(input);

    expect(result.role).toBe('guesser');
    expect(result.playerId).toBeDefined();
    expect(lobbyRepositoryMock.save).toHaveBeenCalledTimes(1);
    const savedLobby = lobbyRepositoryMock.save.mock.calls[0][0];
    expect(savedLobby.getPlayers()).toHaveLength(2);
  });

  it('should throw LobbyNotFoundException if lobby does not exist', async () => {
    lobbyRepositoryMock.findByCode.mockResolvedValue(null);

    const input = new JoinLobbyDto('TEST02', 'Charlie');

    await expect(useCase.execute(input)).rejects.toThrow(LobbyNotFoundException);
  });

  it('should accept code in different case and normalize it', async () => {
    const code = LobbyCode.from('TEST01');
    const describer = Player.create('socket-1', 'Alice', 'describer');
    const lobby = Lobby.create(code, describer);

    lobbyRepositoryMock.findByCode.mockResolvedValue(lobby);

    const input = new JoinLobbyDto('test01', 'Diana');
    const result = await useCase.execute(input);

    expect(result.role).toBe('guesser');
    expect(lobbyRepositoryMock.findByCode).toHaveBeenCalledWith('TEST01');
  });

  it('should persist the updated lobby', async () => {
    const code = LobbyCode.from('TEST01');
    const describer = Player.create('socket-1', 'Alice', 'describer');
    const lobby = Lobby.create(code, describer);

    lobbyRepositoryMock.findByCode.mockResolvedValue(lobby);

    const input = new JoinLobbyDto('TEST01', 'Eve');
    await useCase.execute(input);

    expect(lobbyRepositoryMock.save).toHaveBeenCalledTimes(1);
  });
});
