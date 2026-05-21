import { StartRoundUseCase } from './start-round.use-case';
import { LobbyRepository } from '../../domain/repositories/lobby.repository';
import { CardRepository } from '../../../card/domain/repositories/card.repository';
import { Lobby } from '../../domain/entities/lobby.entity';
import { Player } from '../../domain/entities/player.entity';
import { LobbyCode } from '../../domain/value-objects/lobby-code.value-object';
import { CardMother } from '../../../card/domain/testing/card.mother';
import { OnlyDescriberCanException } from '../../domain/exceptions/only-describer-can.exception';
import { LobbyNotFoundException } from '../../domain/exceptions/lobby-not-found.exception';
import { CardNotFoundException } from '../../../card/domain/exceptions/card-not-found.exception';

describe('StartRoundUseCase', () => {
  let useCase: StartRoundUseCase;
  let lobbyRepositoryMock: jest.Mocked<LobbyRepository>;
  let cardRepositoryMock: jest.Mocked<CardRepository>;

  beforeEach(() => {
    lobbyRepositoryMock = {
      save: jest.fn(),
      findByCode: jest.fn(),
    };
    cardRepositoryMock = {
      findRandom: jest.fn(),
    };
    useCase = new StartRoundUseCase(lobbyRepositoryMock, cardRepositoryMock);
  });

  it('should start a round with a random card', async () => {
    const code = LobbyCode.from('TEST01');
    const describer = Player.create('socket-1', 'Alice', 'describer');
    const lobby = Lobby.create(code, describer);
    const card = CardMother.valid();

    lobbyRepositoryMock.findByCode.mockResolvedValue(lobby);
    cardRepositoryMock.findRandom.mockResolvedValue(card);

    const result = await useCase.execute({
      lobbyCode: 'TEST01',
      playerId: 'socket-1',
      durationSeconds: 60,
    });

    expect(result.startAt).toBeDefined();
    expect(result.durationSeconds).toBe(60);
    expect(result.card).toBeDefined();
    expect(result.card?.word).toBe(card.word.value);
  });

  it('should throw OnlyDescriberCanException if player is not describer', async () => {
    const code = LobbyCode.from('TEST01');
    const describer = Player.create('socket-1', 'Alice', 'describer');
    const lobby = Lobby.create(code, describer);
    const guesser = Player.create('socket-2', 'Bob', 'guesser');
    lobby.join(guesser);

    lobbyRepositoryMock.findByCode.mockResolvedValue(lobby);

    await expect(
      useCase.execute({
        lobbyCode: 'TEST01',
        playerId: 'socket-2',
        durationSeconds: 60,
      }),
    ).rejects.toThrow(OnlyDescriberCanException);
  });

  it('should throw LobbyNotFoundException if lobby does not exist', async () => {
    lobbyRepositoryMock.findByCode.mockResolvedValue(null);

    await expect(
      useCase.execute({
        lobbyCode: 'INVALID',
        playerId: 'socket-1',
        durationSeconds: 60,
      }),
    ).rejects.toThrow(LobbyNotFoundException);
  });

  it('should throw CardNotFoundException if no cards available', async () => {
    const code = LobbyCode.from('TEST01');
    const describer = Player.create('socket-1', 'Alice', 'describer');
    const lobby = Lobby.create(code, describer);

    lobbyRepositoryMock.findByCode.mockResolvedValue(lobby);
    cardRepositoryMock.findRandom.mockResolvedValue(null);

    await expect(
      useCase.execute({
        lobbyCode: 'TEST01',
        playerId: 'socket-1',
        durationSeconds: 60,
      }),
    ).rejects.toThrow(CardNotFoundException);
  });

  it('should persist the lobby with updated round session', async () => {
    const code = LobbyCode.from('TEST01');
    const describer = Player.create('socket-1', 'Alice', 'describer');
    const lobby = Lobby.create(code, describer);
    const card = CardMother.valid();

    lobbyRepositoryMock.findByCode.mockResolvedValue(lobby);
    cardRepositoryMock.findRandom.mockResolvedValue(card);

    await useCase.execute({
      lobbyCode: 'TEST01',
      playerId: 'socket-1',
      durationSeconds: 120,
    });

    expect(lobbyRepositoryMock.save).toHaveBeenCalledTimes(1);
    const savedLobby = lobbyRepositoryMock.save.mock.calls[0][0];
    expect(savedLobby.getStatus()).toBe('playing');
    expect(savedLobby.getRoundSession()).toBeDefined();
    expect(savedLobby.getRoundSession()!.bannedWords).toBeDefined();
  });
});
