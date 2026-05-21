import { describe, it, expect, vi } from 'vitest';
import { RejoinRound } from './rejoin-round.use-case';
import { LobbySocket } from '../ports/lobby-socket.port';

describe('RejoinRound', () => {
  const fakeSocket: LobbySocket = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    joinLobby: vi.fn(),
    startRound: vi.fn(),
    nextCard: vi.fn(),
    submitGuess: vi.fn(),
    onConnect: vi.fn(),
    onLobbyUpdated: vi.fn(),
    onRoundStarted: vi.fn(),
    onCardChanged: vi.fn(),
    onGuessResult: vi.fn(),
    onError: vi.fn(),
  };

  it('should call connect and joinLobby with correct args', () => {
    const rejoinRound = new RejoinRound(fakeSocket);

    rejoinRound.execute('ABC123', 'John Doe', 'describer', 'player-id-123');

    expect(fakeSocket.connect).toHaveBeenCalled();
    expect(fakeSocket.joinLobby).toHaveBeenCalledWith(
      'ABC123',
      'John Doe',
      'describer',
      'player-id-123',
    );
  });

  it('should pass playerId to joinLobby', () => {
    const rejoinRound = new RejoinRound(fakeSocket);

    rejoinRound.execute('XYZ789', 'Jane Smith', 'guesser', 'player-uuid-456');

    expect(fakeSocket.joinLobby).toHaveBeenCalledWith(
      'XYZ789',
      'Jane Smith',
      'guesser',
      'player-uuid-456',
    );
    expect(fakeSocket.connect).toHaveBeenCalled();
  });
});
