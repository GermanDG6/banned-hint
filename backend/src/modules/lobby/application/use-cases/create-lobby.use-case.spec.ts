import { CreateLobbyUseCase } from './create-lobby.use-case';
import { LobbyRepository } from '../../domain/repositories/lobby.repository';
import { CreateLobbyDto } from '../dtos/create-lobby.dto';

describe('CreateLobbyUseCase', () => {
  let useCase: CreateLobbyUseCase;
  let lobbyRepositoryMock: jest.Mocked<LobbyRepository>;

  beforeEach(() => {
    lobbyRepositoryMock = {
      save: jest.fn(),
      findByCode: jest.fn(),
    };
    useCase = new CreateLobbyUseCase(lobbyRepositoryMock);
  });

  it('should create a lobby with a unique code and return player id', async () => {
    const input = new CreateLobbyDto({ id: 'uuid', name: 'Alice', role: 'describer' }, 60);

    const result = await useCase.execute(input);

    expect(result.code).toMatch(/^[A-Z0-9]{6}$/);
    expect(result.playerId).toBeDefined();
    expect(result.role).toBe('describer');
    expect(lobbyRepositoryMock.save).toHaveBeenCalledTimes(1);
  });

  it('should generate different codes for different lobbies', async () => {
    const input = new CreateLobbyDto({ id: 'uuid', name: 'Alice', role: 'describer' }, 60);

    const result1 = await useCase.execute(input);
    const result2 = await useCase.execute(input);

    expect(result1.code).not.toBe(result2.code);
  });

  it('should persist the lobby with save method', async () => {
    const input = new CreateLobbyDto({ id: 'uuid', name: 'Bob', role: 'describer' }, 120);

    await useCase.execute(input);

    expect(lobbyRepositoryMock.save).toHaveBeenCalledTimes(1);
    const savedLobby = lobbyRepositoryMock.save.mock.calls[0][0];
    expect(savedLobby).toBeDefined();
    expect(savedLobby.getPlayers()).toHaveLength(1);
    expect(savedLobby.getPlayers()[0].isDescriber()).toBe(true);
  });

  it('should return describer role for host', async () => {
    const input = new CreateLobbyDto({ id: 'uuid', name: 'Charlie', role: 'describer' }, 90);

    const result = await useCase.execute(input);

    expect(result.role).toBe('describer');
  });
});
