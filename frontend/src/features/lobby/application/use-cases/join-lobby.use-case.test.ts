import { describe, it, expect, vi } from 'vitest';
import { JoinLobby } from './join-lobby.use-case';
import { LobbyHttpPort } from '../ports/lobby-http.port';
import { LobbySocket } from '../ports/lobby-socket.port';
import { LobbyNotFoundException } from '../../domain/exceptions/lobby-not-found.exception';
import { Lobby } from '../../domain/models/lobby.model.ts';

describe('JoinLobby', () => {
  const fakeLobby: Lobby = {
    code: 'ABC123',
    status: 'waiting',
    players: [
      {
        id: 'player-1',
        name: 'Host',
        role: 'describer',
      },
    ],
  };

  it('should connect to socket and join lobby when lobby exists', async () => {
    const fakeHttpPort: LobbyHttpPort = {
      getLobby: vi.fn().mockResolvedValue(fakeLobby),
      createLobby: vi.fn(),
    };

    const fakeSocket: LobbySocket = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      joinLobby: vi.fn(),
      startRound: vi.fn(),
      nextCard: vi.fn(),
      submitGuess: vi.fn(),
      onLobbyUpdated: vi.fn(),
      onRoundStarted: vi.fn(),
      onCardChanged: vi.fn(),
      onGuessResult: vi.fn(),
      onError: vi.fn(),
    };

    const joinLobby = new JoinLobby(fakeHttpPort, fakeSocket);
    await joinLobby.execute('ABC123', 'Player 2', 'guesser');

    expect(fakeHttpPort.getLobby).toHaveBeenCalledWith('ABC123');
    expect(fakeSocket.connect).toHaveBeenCalled();
    expect(fakeSocket.joinLobby).toHaveBeenCalledWith('ABC123', 'Player 2', 'guesser');
  });

  it('should throw LobbyNotFoundException when lobby does not exist', async () => {
    const fakeHttpPort: LobbyHttpPort = {
      getLobby: vi.fn().mockResolvedValue(null),
      createLobby: vi.fn(),
    };

    const fakeSocket: LobbySocket = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      joinLobby: vi.fn(),
      startRound: vi.fn(),
      nextCard: vi.fn(),
      submitGuess: vi.fn(),
      onLobbyUpdated: vi.fn(),
      onRoundStarted: vi.fn(),
      onCardChanged: vi.fn(),
      onGuessResult: vi.fn(),
      onError: vi.fn(),
    };

    const joinLobby = new JoinLobby(fakeHttpPort, fakeSocket);

    await expect(joinLobby.execute('INVALID', 'Player 2', 'guesser')).rejects.toThrow(
      LobbyNotFoundException,
    );
    expect(fakeSocket.connect).not.toHaveBeenCalled();
  });

  it('should not connect to socket if getLobby throws an error', async () => {
    const fakeHttpPort: LobbyHttpPort = {
      getLobby: vi.fn().mockRejectedValue(new Error('Network error')),
      createLobby: vi.fn(),
    };

    const fakeSocket: LobbySocket = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      joinLobby: vi.fn(),
      startRound: vi.fn(),
      nextCard: vi.fn(),
      submitGuess: vi.fn(),
      onLobbyUpdated: vi.fn(),
      onRoundStarted: vi.fn(),
      onCardChanged: vi.fn(),
      onGuessResult: vi.fn(),
      onError: vi.fn(),
    };

    const joinLobby = new JoinLobby(fakeHttpPort, fakeSocket);

    await expect(joinLobby.execute('ABC123', 'Player 2', 'guesser')).rejects.toThrow(
      'Network error',
    );
    expect(fakeSocket.connect).not.toHaveBeenCalled();
  });
});
