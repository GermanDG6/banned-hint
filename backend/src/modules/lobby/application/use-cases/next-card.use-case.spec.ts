import { NextCardUseCase } from './next-card.use-case';
import { LobbyRepository } from '../../domain/repositories/lobby.repository';
import { CardRepository } from '../../../card/domain/repositories/card.repository';
import { Lobby } from '../../domain/entities/lobby.entity';
import { Player } from '../../domain/entities/player.entity';
import { LobbyCode } from '../../domain/value-objects/lobby-code.value-object';
import { PlayerRoleType } from '../../domain/value-objects/player-role.value-object';
import { CardMother } from '../../../card/domain/testing/card.mother';
import { OnlyDescriberCanException } from '../../domain/exceptions/only-describer-can.exception';
import { LobbyNotFoundException } from '../../domain/exceptions/lobby-not-found.exception';
import { CardNotFoundException } from '../../../card/domain/exceptions/card-not-found.exception';

describe('NextCardUseCase', () => {
  let nextCardUseCase: NextCardUseCase;
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
    nextCardUseCase = new NextCardUseCase(lobbyRepositoryMock, cardRepositoryMock);
  });

  it('should move to next card in ongoing round', async () => {
    const code = LobbyCode.from('TEST01');
    const describer = Player.create('socket-1', 'Alice', PlayerRoleType.Describer);
    const lobby = Lobby.create(code, describer);
    const firstCard = CardMother.withWord('apple');
    const secondCard = CardMother.withWord('banana');

    lobby.startRound(firstCard.id.value, firstCard.word.value, firstCard.bannedWords.toArray(), 60);
    const originalStartAt = lobby.getRoundSession()!.startAt;

    lobbyRepositoryMock.findByCode.mockResolvedValue(lobby);
    cardRepositoryMock.findRandom.mockResolvedValue(secondCard);

    const result = await nextCardUseCase.execute({
      lobbyCode: 'TEST01',
      playerId: 'socket-1',
    });

    expect(result.card?.word).toBe('banana');
    expect(result.startAt).toBe(originalStartAt); // startAt should remain the same
  });

  it('should keep the same duration when moving to next card', async () => {
    const code = LobbyCode.from('TEST01');
    const describer = Player.create('socket-1', 'Alice', PlayerRoleType.Describer);
    const lobby = Lobby.create(code, describer);
    const firstCard = CardMother.withWord('apple');
    const secondCard = CardMother.withWord('banana');
    const durationSeconds = 120;

    lobby.startRound(
      firstCard.id.value,
      firstCard.word.value,
      firstCard.bannedWords.toArray(),
      durationSeconds,
    );

    lobbyRepositoryMock.findByCode.mockResolvedValue(lobby);
    cardRepositoryMock.findRandom.mockResolvedValue(secondCard);

    const result = await nextCardUseCase.execute({
      lobbyCode: 'TEST01',
      playerId: 'socket-1',
    });

    expect(result.durationSeconds).toBe(durationSeconds);
  });

  it('should throw OnlyDescriberCanException if player is not describer', async () => {
    const code = LobbyCode.from('TEST01');
    const describer = Player.create('socket-1', 'Alice', PlayerRoleType.Describer);
    const lobby = Lobby.create(code, describer);
    const guesser = Player.create('socket-2', 'Bob', PlayerRoleType.Guesser);
    lobby.join(guesser);

    const firstCard = CardMother.withWord('apple');
    lobby.startRound(firstCard.id.value, firstCard.word.value, firstCard.bannedWords.toArray(), 60);

    lobbyRepositoryMock.findByCode.mockResolvedValue(lobby);

    await expect(
      nextCardUseCase.execute({
        lobbyCode: 'TEST01',
        playerId: 'socket-2',
      }),
    ).rejects.toThrow(OnlyDescriberCanException);
  });

  it('should throw LobbyNotFoundException if lobby does not exist', async () => {
    lobbyRepositoryMock.findByCode.mockResolvedValue(null);

    await expect(
      nextCardUseCase.execute({
        lobbyCode: 'INVALID',
        playerId: 'socket-1',
      }),
    ).rejects.toThrow(LobbyNotFoundException);
  });

  it('should throw CardNotFoundException if no cards available', async () => {
    const code = LobbyCode.from('TEST01');
    const describer = Player.create('socket-1', 'Alice', PlayerRoleType.Describer);
    const lobby = Lobby.create(code, describer);

    const firstCard = CardMother.withWord('apple');
    lobby.startRound(firstCard.id.value, firstCard.word.value, firstCard.bannedWords.toArray(), 60);

    lobbyRepositoryMock.findByCode.mockResolvedValue(lobby);
    cardRepositoryMock.findRandom.mockResolvedValue(null);

    await expect(
      nextCardUseCase.execute({
        lobbyCode: 'TEST01',
        playerId: 'socket-1',
      }),
    ).rejects.toThrow(CardNotFoundException);
  });

  it('should persist the lobby with updated round session', async () => {
    const code = LobbyCode.from('TEST01');
    const describer = Player.create('socket-1', 'Alice', PlayerRoleType.Describer);
    const lobby = Lobby.create(code, describer);
    const firstCard = CardMother.withWord('apple');
    const secondCard = CardMother.withWord('banana');

    lobby.startRound(firstCard.id.value, firstCard.word.value, firstCard.bannedWords.toArray(), 60);

    lobbyRepositoryMock.findByCode.mockResolvedValue(lobby);
    cardRepositoryMock.findRandom.mockResolvedValue(secondCard);

    await nextCardUseCase.execute({
      lobbyCode: 'TEST01',
      playerId: 'socket-1',
    });

    expect(lobbyRepositoryMock.save).toHaveBeenCalledTimes(1);
    const savedLobby = lobbyRepositoryMock.save.mock.calls[0][0];
    expect(savedLobby.getStatus()).toBe('playing');
  });
});
