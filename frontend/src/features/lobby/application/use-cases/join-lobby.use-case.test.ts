import { describe, it, expect, vi } from 'vitest';
import { JoinLobby } from './join-lobby.use-case';
import { LobbyHttpPort } from '../ports/lobby-http.port';
import { LobbySocket } from '../ports/lobby-socket.port';
import { LobbyNotFoundException } from '../../domain/exceptions/lobby-not-found.exception';
import { Lobby, LobbyStatusType } from '../../domain/models/lobby.model.ts';
import { Player } from '../../domain/entities/player.entity';
import { PlayerRoleType } from '../../domain/models/player.model';

describe('JoinLobby', () => {
  const validUUID1 = '550e8400-e29b-41d4-a716-446655440000';
  const validUUID2 = '550e8400-e29b-41d4-a716-446655440001';

  const fakeLobby: Lobby = {
    code: 'ABC123',
    status: LobbyStatusType.Waiting,
    players: [Player.create('Host', PlayerRoleType.Describer, validUUID1)],
  };
  const fakeSocket: LobbySocket = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    joinLobby: vi.fn(),
    startRound: vi.fn(),
    nextCard: vi.fn(),
    submitGuess: vi.fn(),
    endRound: vi.fn(),
    onConnect: vi.fn(),
    onLobbyUpdated: vi.fn(),
    onRoundStarted: vi.fn(),
    onCardChanged: vi.fn(),
    onGuessResult: vi.fn(),
    onError: vi.fn(),
    onRoundEnded: vi.fn(),
  };

  it('should connect to socket and join lobby when lobby exists', async () => {
    const fakeHttpPort: LobbyHttpPort = {
      getLobby: vi.fn().mockResolvedValue(fakeLobby),
      createLobby: vi.fn(),
    };

    const joinLobby = new JoinLobby(fakeHttpPort, fakeSocket);
    await joinLobby.execute('ABC123', 'Player 2', 'guesser', validUUID2);

    expect(fakeHttpPort.getLobby).toHaveBeenCalledWith('ABC123');
    expect(fakeSocket.connect).toHaveBeenCalled();
    expect(fakeSocket.joinLobby).toHaveBeenCalledWith('ABC123', 'Player 2', 'guesser', validUUID2);
  });

  it('should throw LobbyNotFoundException when lobby does not exist', async () => {
    const fakeHttpPort: LobbyHttpPort = {
      getLobby: vi.fn().mockResolvedValue(null),
      createLobby: vi.fn(),
    };
    const localFakeSocket: LobbySocket = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      joinLobby: vi.fn(),
      startRound: vi.fn(),
      nextCard: vi.fn(),
      submitGuess: vi.fn(),
      endRound: vi.fn(),
      onConnect: vi.fn(),
      onLobbyUpdated: vi.fn(),
      onRoundStarted: vi.fn(),
      onCardChanged: vi.fn(),
      onGuessResult: vi.fn(),
      onError: vi.fn(),
      onRoundEnded: vi.fn(),
    };

    const joinLobby = new JoinLobby(fakeHttpPort, localFakeSocket);

    await expect(joinLobby.execute('INVALID', 'Player 2', 'guesser')).rejects.toThrow(
      LobbyNotFoundException,
    );
    expect(localFakeSocket.connect).not.toHaveBeenCalled();
  });

  it('should not connect to socket if getLobby throws an error', async () => {
    const fakeHttpPort: LobbyHttpPort = {
      getLobby: vi.fn().mockRejectedValue(new Error('Network error')),
      createLobby: vi.fn(),
    };
    const localFakeSocket: LobbySocket = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      joinLobby: vi.fn(),
      startRound: vi.fn(),
      nextCard: vi.fn(),
      submitGuess: vi.fn(),
      endRound: vi.fn(),
      onConnect: vi.fn(),
      onLobbyUpdated: vi.fn(),
      onRoundStarted: vi.fn(),
      onCardChanged: vi.fn(),
      onGuessResult: vi.fn(),
      onError: vi.fn(),
      onRoundEnded: vi.fn(),
    };

    const joinLobby = new JoinLobby(fakeHttpPort, localFakeSocket);

    await expect(joinLobby.execute('ABC123', 'Player 2', 'guesser')).rejects.toThrow(
      'Network error',
    );
    expect(localFakeSocket.connect).not.toHaveBeenCalled();
  });
});
