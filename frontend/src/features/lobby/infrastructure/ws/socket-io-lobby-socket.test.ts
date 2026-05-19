import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock socket.io-client with hoisting to top of file (before any imports)
vi.mock('socket.io-client', () => {
  const mockSocket = {
    emit: vi.fn(),
    on: vi.fn(),
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
      const players = [{ id: 'p1', name: 'Alice', role: 'describer' as const }];
      eventHandler({ players });

      expect(handler).toHaveBeenCalledWith(players);
    });

    it('should throw error if not connected', () => {
      const handler = vi.fn();

      expect(() => socketAdapter.onLobbyUpdated(handler)).toThrow('Socket not connected');
    });
  });

  describe('onRoundStarted', () => {
    it('should register handler for round-started event', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      socketAdapter.onRoundStarted(handler);

      expect(mockSocket.on).toHaveBeenCalledWith('round-started', expect.any(Function));
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

    it('should throw error if not connected', () => {
      const handler = vi.fn();

      expect(() => socketAdapter.onRoundStarted(handler)).toThrow('Socket not connected');
    });
  });

  describe('onCardChanged', () => {
    it('should register handler for card-changed event', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      socketAdapter.onCardChanged(handler);

      expect(mockSocket.on).toHaveBeenCalledWith('card-changed', expect.any(Function));
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

    it('should throw error if not connected', () => {
      const handler = vi.fn();

      expect(() => socketAdapter.onCardChanged(handler)).toThrow('Socket not connected');
    });
  });

  describe('onGuessResult', () => {
    it('should register handler for guess-result event', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      socketAdapter.onGuessResult(handler);

      expect(mockSocket.on).toHaveBeenCalledWith('guess-result', expect.any(Function));
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

    it('should throw error if not connected', () => {
      const handler = vi.fn();

      expect(() => socketAdapter.onGuessResult(handler)).toThrow('Socket not connected');
    });
  });

  describe('onError', () => {
    it('should register handler for error event', () => {
      socketAdapter.connect();
      const mockSocket = vi.mocked(io).mock.results[0].value;
      const handler = vi.fn();

      socketAdapter.onError(handler);

      expect(mockSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
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

    it('should throw error if not connected', () => {
      const handler = vi.fn();

      expect(() => socketAdapter.onError(handler)).toThrow('Socket not connected');
    });
  });
});
