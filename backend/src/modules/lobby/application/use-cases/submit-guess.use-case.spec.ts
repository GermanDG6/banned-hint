import { SubmitGuessUseCase } from './submit-guess.use-case';
import { LobbyRepository } from '../../domain/repositories/lobby.repository';
import { Lobby } from '../../domain/entities/lobby.entity';
import { Player } from '../../domain/entities/player.entity';
import { LobbyCode } from '../../domain/value-objects/lobby-code.value-object';
import { CardMother } from '../../../card/domain/testing/card.mother';
import { LobbyNotFoundException } from '../../domain/exceptions/lobby-not-found.exception';

describe('SubmitGuessUseCase', () => {
  let useCase: SubmitGuessUseCase;
  let lobbyRepositoryMock: jest.Mocked<LobbyRepository>;

  beforeEach(() => {
    lobbyRepositoryMock = {
      save: jest.fn(),
      findByCode: jest.fn(),
    };
    useCase = new SubmitGuessUseCase(lobbyRepositoryMock);
  });

  it('should return correct=true when guess matches the word', async () => {
    const code = LobbyCode.from('TEST01');
    const describer = Player.create('socket-1', 'Alice', 'describer');
    const lobby = Lobby.create(code, describer);
    const card = CardMother.withWord('apple');

    lobby.startRound(card.id.value, card.word.value, card.bannedWords.toArray(), 60);

    lobbyRepositoryMock.findByCode.mockResolvedValue(lobby);

    const result = await useCase.execute({
      lobbyCode: 'TEST01',
      word: 'apple',
    });

    expect(result.correct).toBe(true);
  });

  it('should return correct=false when guess does not match', async () => {
    const code = LobbyCode.from('TEST01');
    const describer = Player.create('socket-1', 'Alice', 'describer');
    const lobby = Lobby.create(code, describer);
    const card = CardMother.withWord('apple');

    lobby.startRound(card.id.value, card.word.value, card.bannedWords.toArray(), 60);

    lobbyRepositoryMock.findByCode.mockResolvedValue(lobby);

    const result = await useCase.execute({
      lobbyCode: 'TEST01',
      word: 'banana',
    });

    expect(result.correct).toBe(false);
  });

  it('should be case-insensitive', async () => {
    const code = LobbyCode.from('TEST01');
    const describer = Player.create('socket-1', 'Alice', 'describer');
    const lobby = Lobby.create(code, describer);
    const card = CardMother.withWord('Apple');

    lobby.startRound(card.id.value, card.word.value, card.bannedWords.toArray(), 60);

    lobbyRepositoryMock.findByCode.mockResolvedValue(lobby);

    const result1 = await useCase.execute({
      lobbyCode: 'TEST01',
      word: 'apple',
    });

    const result2 = await useCase.execute({
      lobbyCode: 'TEST01',
      word: 'APPLE',
    });

    expect(result1.correct).toBe(true);
    expect(result2.correct).toBe(true);
  });

  it('should trim whitespace', async () => {
    const code = LobbyCode.from('TEST01');
    const describer = Player.create('socket-1', 'Alice', 'describer');
    const lobby = Lobby.create(code, describer);
    const card = CardMother.withWord('apple');

    lobby.startRound(card.id.value, card.word.value, card.bannedWords.toArray(), 60);

    lobbyRepositoryMock.findByCode.mockResolvedValue(lobby);

    const result = await useCase.execute({
      lobbyCode: 'TEST01',
      word: '  apple  ',
    });

    expect(result.correct).toBe(true);
  });

  it('should throw LobbyNotFoundException if lobby does not exist', async () => {
    lobbyRepositoryMock.findByCode.mockResolvedValue(null);

    await expect(
      useCase.execute({
        lobbyCode: 'INVALID',
        word: 'apple',
      }),
    ).rejects.toThrow(LobbyNotFoundException);
  });

  it('should throw error if no active round session', async () => {
    const code = LobbyCode.from('TEST01');
    const describer = Player.create('socket-1', 'Alice', 'describer');
    const lobby = Lobby.create(code, describer);

    lobbyRepositoryMock.findByCode.mockResolvedValue(lobby);

    await expect(
      useCase.execute({
        lobbyCode: 'TEST01',
        word: 'apple',
      }),
    ).rejects.toThrow('No active round session');
  });
});
