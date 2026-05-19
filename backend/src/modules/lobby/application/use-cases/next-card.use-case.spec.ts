import { NextCardUseCase } from './next-card.use-case';
import { LobbyRepository } from '../../domain/repositories/lobby.repository';
import { CardRepository } from '../../../card/domain/repositories/card.repository';
import { Lobby } from '../../domain/entities/lobby.entity';
import { Player } from '../../domain/entities/player.entity';
import { LobbyCode } from '../../domain/value-objects/lobby-code.value-object';
import { CardMother } from '../../../card/domain/testing/card.mother';
import { OnlyDescriberCanException } from '../../domain/exceptions/only-describer-can.exception';
import { LobbyNotFoundException } from '../../domain/exceptions/lobby-not-found.exception';
import { CardNotFoundException } from '../../../card/domain/exceptions/card-not-found.exception';

describe('NextCardUseCase', () => {
  let useCase: NextCardUseCase;
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
    useCase = new NextCardUseCase(lobbyRepositoryMock, cardRepositoryMock);
  });

  it('should move to next card in ongoing round', async () => {
    const code = LobbyCode.from('TEST01');
    const describer = Player.create('socket-1', 'Alice', 'describer');
    const lobby = Lobby.create(code, describer);
    const firstCard = CardMother.withWord('apple');
    const secondCard = CardMother.withWord('banana');

    // Start the round with the first card
    lobby.startRound(firstCard.id.value, firstCard.word.value, 60);

    lobbyRepositoryMock.findByCode.mockResolvedValue(lobby);
    cardRepositoryMock.findRandom.mockResolvedValue(secondCard);

    const result = await useCase.execute({
      lobbyCode: 'TEST01',
      playerId: 'socket-1',
    });

    expect(result.card?.word).toBe('banana');
    expect(parseInt(result.startAt.toString())).toBeCloseTo(Date.now(), -3); // Within ~1 second
  });

  it('should keep the same duration when moving to next card', async () => {
    const code = LobbyCode.from('TEST01');
    const describer = Player.create('socket-1', 'Alice', 'describer');
    const lobby = Lobby.create(code, describer);
    const firstCard = CardMother.withWord('apple');
    const secondCard = CardMother.withWord('banana');

    // Start the round with 120 seconds duration
    lobby.startRound(firstCard.id.value, firstCard.word.value, 120);

    lobbyRepositoryMock.findByCode.mockResolvedValue(lobby);
    cardRepositoryMock.findRandom.mockResolvedValue(secondCard);

    const result = await useCase.execute({
      lobbyCode: 'TEST01',
      playerId: 'socket-1',
    });

    expect(result.durationSeconds).toBe(120);
  });

  it('should throw OnlyDescriberCanException if player is not describer', async () => {
    const code = LobbyCode.from('TEST01');
    const describer = Player.create('socket-1', 'Alice', 'describer');
    const lobby = Lobby.create(code, describer);
    const guesser = Player.create('socket-2', 'Bob', 'guesser');
    lobby.join(guesser);

    const firstCard = CardMother.withWord('apple');
    lobby.startRound(firstCard.id.value, firstCard.word.value, 60);

    lobbyRepositoryMock.findByCode.mockResolvedValue(lobby);

    await expect(
      useCase.execute({
        lobbyCode: 'TEST01',
        playerId: 'socket-2',
      }),
    ).rejects.toThrow(OnlyDescriberCanException);
  });

  it('should throw LobbyNotFoundException if lobby does not exist', async () => {
    lobbyRepositoryMock.findByCode.mockResolvedValue(null);

    await expect(
      useCase.execute({
        lobbyCode: 'INVALID',
        playerId: 'socket-1',
      }),
    ).rejects.toThrow(LobbyNotFoundException);
  });

  it('should throw CardNotFoundException if no cards available', async () => {
    const code = LobbyCode.from('TEST01');
    const describer = Player.create('socket-1', 'Alice', 'describer');
    const lobby = Lobby.create(code, describer);

    const firstCard = CardMother.withWord('apple');
    lobby.startRound(firstCard.id.value, firstCard.word.value, 60);

    lobbyRepositoryMock.findByCode.mockResolvedValue(lobby);
    cardRepositoryMock.findRandom.mockResolvedValue(null);

    await expect(
      useCase.execute({
        lobbyCode: 'TEST01',
        playerId: 'socket-1',
      }),
    ).rejects.toThrow(CardNotFoundException);
  });

  it('should persist the lobby with updated round session', async () => {
    const code = LobbyCode.from('TEST01');
    const describer = Player.create('socket-1', 'Alice', 'describer');
    const lobby = Lobby.create(code, describer);
    const firstCard = CardMother.withWord('apple');
    const secondCard = CardMother.withWord('banana');

    lobby.startRound(firstCard.id.value, firstCard.word.value, 60);

    lobbyRepositoryMock.findByCode.mockResolvedValue(lobby);
    cardRepositoryMock.findRandom.mockResolvedValue(secondCard);

    await useCase.execute({
      lobbyCode: 'TEST01',
      playerId: 'socket-1',
    });

    expect(lobbyRepositoryMock.save).toHaveBeenCalledTimes(1);
    const savedLobby = lobbyRepositoryMock.save.mock.calls[0][0];
    expect(savedLobby.getStatus()).toBe('playing');
  });
});
