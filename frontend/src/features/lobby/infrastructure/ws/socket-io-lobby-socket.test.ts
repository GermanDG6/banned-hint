import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('socket.io-client', () => {
  const mockSocket = {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    disconnect: vi.fn(),
  };

  const mockIO = vi.fn(() => mockSocket);

  return {
    io: mockIO,
  };
});

import { SocketIOLobbySocket } from './socket-io-lobby-socket';
import { io } from 'socket.io-client';

describe('SocketIOLobbySocket', () => {
  let socketAdapter: SocketIOLobbySocket;

  beforeEach(() => {
    vi.clearAllMocks();
    socketAdapter = new SocketIOLobbySocket();
  });

  afterEach(() => {
    socketAdapter.disconnect();
  });

  describe('connect', () => {
    it('should call io() with correct server URL and options', () => {
      socketAdapter.connect();

      expect(io).toHaveBeenCalledWith('http://localhost:3000', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });
    });

    it('should not create a new socket if already connected', () => {
      socketAdapter.connect();
      const firstCallCount = vi.mocked(io).mock.calls.length;

      socketAdapter.connect();

      expect(vi.mocked(io).mock.calls.length).toBe(firstCallCount);
    });
  });

  describe('disconnect', () => {
    it('should disconnect the socket', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;

      socketAdapter.disconnect();

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('should allow reconnecting after disconnect', () => {
      socketAdapter.connect();
      socketAdapter.disconnect();
      vi.mocked(io).mockClear();

      socketAdapter.connect();

      expect(io).toHaveBeenCalled();
    });
  });

  describe('joinLobby', () => {
    beforeEach(() => {
      socketAdapter.connect();
    });

    it('should emit join-lobby event with correct data', () => {
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const playerId = '550e8400-e29b-41d4-a716-446655440001';

      socketAdapter.joinLobby('ABC123', 'Alice', 'guesser', playerId);

      expect(mockSocket.emit).toHaveBeenCalledWith('join-lobby', {
        code: 'ABC123',
        playerName: 'Alice',
        role: 'guesser',
        playerId,
      });
    });

    it('should emit join-lobby event without playerId when not provided', () => {
      const mockSocket = vi.mocked(io).mock.results[0].value;

      socketAdapter.joinLobby('ABC123', 'Alice', 'guesser');

      expect(mockSocket.emit).toHaveBeenCalledWith('join-lobby', {
        code: 'ABC123',
        playerName: 'Alice',
        role: 'guesser',
      });
    });

    it('should throw error if not connected', () => {
      socketAdapter.disconnect();

      expect(() => socketAdapter.joinLobby('ABC123', 'Alice', 'guesser')).toThrow(
        'Socket not connected',
      );
    });
  });

  describe('startRound', () => {
    beforeEach(() => {
      socketAdapter.connect();
    });

    it('should emit start-round event with duration', () => {
      const mockSocket = vi.mocked(io).mock.results[0].value;

      socketAdapter.startRound(60);

      expect(mockSocket.emit).toHaveBeenCalledWith('start-round', {
        durationSeconds: 60,
      });
    });

    it('should throw error if not connected', () => {
      socketAdapter.disconnect();

      expect(() => socketAdapter.startRound(60)).toThrow('Socket not connected');
    });
  });

  describe('nextCard', () => {
    beforeEach(() => {
      socketAdapter.connect();
    });

    it('should emit next-card event', () => {
      const mockSocket = vi.mocked(io).mock.results[0].value;

      socketAdapter.nextCard();

      expect(mockSocket.emit).toHaveBeenCalledWith('next-card', {});
    });

    it('should throw error if not connected', () => {
      socketAdapter.disconnect();

      expect(() => socketAdapter.nextCard()).toThrow('Socket not connected');
    });
  });

  describe('submitGuess', () => {
    beforeEach(() => {
      socketAdapter.connect();
    });

    it('should emit submit-guess event with word', () => {
      const mockSocket = vi.mocked(io).mock.results[0].value;

      socketAdapter.submitGuess('apple');

      expect(mockSocket.emit).toHaveBeenCalledWith('submit-guess', {
        word: 'apple',
      });
    });

    it('should throw error if not connected', () => {
      socketAdapter.disconnect();

      expect(() => socketAdapter.submitGuess('apple')).toThrow('Socket not connected');
    });
  });

  describe('onConnect', () => {
    it('should register handler for connect event', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      socketAdapter.onConnect(handler);

      expect(mockSocket.on).toHaveBeenCalledWith('connect', handler);
    });

    it('should return cleanup function that calls socket.off', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      const cleanup = socketAdapter.onConnect(handler);
      cleanup();

      expect(mockSocket.off).toHaveBeenCalledWith('connect', handler);
    });

    it('should not throw when calling onConnect before connect', () => {
      const handler = vi.fn();

      expect(() => socketAdapter.onConnect(handler)).not.toThrow();
    });
  });

  describe('onLobbyUpdated', () => {
    it('should register handler for lobby-updated event', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      socketAdapter.onLobbyUpdated(handler);

      expect(mockSocket.on).toHaveBeenCalledWith('lobby-updated', expect.any(Function));
    });

    it('should call handler with players when event fires', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      socketAdapter.onLobbyUpdated(handler);

      const eventHandler = mockSocket.on.mock.calls[0][1] as (data: unknown) => void;
      const validUUID = '550e8400-e29b-41d4-a716-446655440001';
      const playersData = [{ id: validUUID, name: 'Alice', role: 'describer' as const }];
      eventHandler({ players: playersData });

      expect(handler).toHaveBeenCalled();
      const receivedPlayers = handler.mock.calls[0][0] as { name: string; role: string }[];
      expect(receivedPlayers[0].name).toBe('Alice');
      expect(receivedPlayers[0].role).toBe('describer');
    });

    it('should return cleanup function that calls socket.off', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      const cleanup = socketAdapter.onLobbyUpdated(handler);
      const wrappedHandler = mockSocket.on.mock.calls[0][1];
      cleanup();

      expect(mockSocket.off).toHaveBeenCalledWith('lobby-updated', wrappedHandler);
    });

    it('should not throw when calling onLobbyUpdated before connect', () => {
      const handler = vi.fn();

      expect(() => socketAdapter.onLobbyUpdated(handler)).not.toThrow();
    });
  });

  describe('onRoundStarted', () => {
    it('should register handler for round-started event', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      socketAdapter.onRoundStarted(handler);

      expect(mockSocket.on).toHaveBeenCalledWith('round-started', handler);
    });

    it('should call handler with session when event fires', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      socketAdapter.onRoundStarted(handler);

      const eventHandler = mockSocket.on.mock.calls[0][1] as (session: unknown) => void;
      const session = { startAt: 1000, durationSeconds: 60 };
      eventHandler(session);

      expect(handler).toHaveBeenCalledWith(session);
    });

    it('should return cleanup function that calls socket.off', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      const cleanup = socketAdapter.onRoundStarted(handler);
      cleanup();

      expect(mockSocket.off).toHaveBeenCalledWith('round-started', handler);
    });

    it('should not throw when calling onRoundStarted before connect', () => {
      const handler = vi.fn();

      expect(() => socketAdapter.onRoundStarted(handler)).not.toThrow();
    });
  });

  describe('onCardChanged', () => {
    it('should register handler for card-changed event', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      socketAdapter.onCardChanged(handler);

      expect(mockSocket.on).toHaveBeenCalledWith('card-changed', handler);
    });

    it('should call handler with session when event fires', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      socketAdapter.onCardChanged(handler);

      const eventHandler = mockSocket.on.mock.calls[0][1] as (session: unknown) => void;
      const session = { startAt: 2000, durationSeconds: 60 };
      eventHandler(session);

      expect(handler).toHaveBeenCalledWith(session);
    });

    it('should return cleanup function that calls socket.off', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      const cleanup = socketAdapter.onCardChanged(handler);
      cleanup();

      expect(mockSocket.off).toHaveBeenCalledWith('card-changed', handler);
    });

    it('should not throw when calling onCardChanged before connect', () => {
      const handler = vi.fn();

      expect(() => socketAdapter.onCardChanged(handler)).not.toThrow();
    });
  });

  describe('onGuessResult', () => {
    it('should register handler for guess-result event', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      socketAdapter.onGuessResult(handler);

      expect(mockSocket.on).toHaveBeenCalledWith('guess-result', handler);
    });

    it('should call handler with result when event fires', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      socketAdapter.onGuessResult(handler);

      const eventHandler = mockSocket.on.mock.calls[0][1] as (result: unknown) => void;
      eventHandler({ correct: true });

      expect(handler).toHaveBeenCalledWith({ correct: true });
    });

    it('should return cleanup function that calls socket.off', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      const cleanup = socketAdapter.onGuessResult(handler);
      cleanup();

      expect(mockSocket.off).toHaveBeenCalledWith('guess-result', handler);
    });

    it('should not throw when calling onGuessResult before connect', () => {
      const handler = vi.fn();

      expect(() => socketAdapter.onGuessResult(handler)).not.toThrow();
    });
  });

  describe('onError', () => {
    it('should register handler for error event', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      socketAdapter.onError(handler);

      expect(mockSocket.on).toHaveBeenCalledWith('error', handler);
    });

    it('should call handler with error when event fires', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      socketAdapter.onError(handler);

      const eventHandler = mockSocket.on.mock.calls[0][1] as (error: unknown) => void;
      eventHandler({ message: 'Something went wrong' });

      expect(handler).toHaveBeenCalledWith({ message: 'Something went wrong' });
    });

    it('should return cleanup function that calls socket.off', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      const cleanup = socketAdapter.onError(handler);
      cleanup();

      expect(mockSocket.off).toHaveBeenCalledWith('error', handler);
    });

    it('should not throw when calling onError before connect', () => {
      const handler = vi.fn();

      expect(() => socketAdapter.onError(handler)).not.toThrow();
    });
  });

  describe('onRoundEnded', () => {
    it('should register handler for round-ended event', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      socketAdapter.onRoundEnded(handler);

      expect(mockSocket.on).toHaveBeenCalledWith('round-ended', handler);
    });

    it('should call handler when event fires', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      socketAdapter.onRoundEnded(handler);

      const eventHandler = mockSocket.on.mock.calls[0][1] as () => void;
      eventHandler();

      expect(handler).toHaveBeenCalled();
    });

    it('should return cleanup function that calls socket.off', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      const cleanup = socketAdapter.onRoundEnded(handler);
      cleanup();

      expect(mockSocket.off).toHaveBeenCalledWith('round-ended', handler);
    });

    it('should not throw when calling onRoundEnded before connect', () => {
      const handler = vi.fn();

      expect(() => socketAdapter.onRoundEnded(handler)).not.toThrow();
    });
  });

  describe('endRound', () => {
    it('should emit end-round event when connected', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;

      socketAdapter.endRound();

      expect(mockSocket.emit).toHaveBeenCalledWith('end-round', {});
    });

    it('should throw error if not connected', () => {
      expect(() => socketAdapter.endRound()).toThrow('Socket not connected');
    });
  });

  describe('resilience: register listeners before connect', () => {
    it('should register pending listeners when connect is called after on*', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      socketAdapter.onConnect(handler1);
      socketAdapter.onRoundStarted(handler2);

      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;

      expect(mockSocket.on).toHaveBeenCalledWith('connect', handler1);
      expect(mockSocket.on).toHaveBeenCalledWith('round-started', handler2);
    });

    it('should cleanup pending listener before connect is called', () => {
      vi.clearAllMocks();
      const socketAdapterLocal = new SocketIOLobbySocket();
      const handler = vi.fn();

      const cleanup = socketAdapterLocal.onConnect(handler);

      cleanup();

      socketAdapterLocal.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;

      const connectCalls = mockSocket.on.mock.calls.filter(
        (call: unknown[]) => call[0] === 'connect',
      );
      expect(connectCalls.length).toBe(0);
    });

    it('should cleanup registered listener after connect is called', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      const cleanup = socketAdapter.onConnect(handler);

      expect(mockSocket.on).toHaveBeenCalledWith('connect', handler);

      cleanup();

      expect(mockSocket.off).toHaveBeenCalledWith('connect', handler);
    });
  });
});
