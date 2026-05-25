import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLobby } from './use-lobby.hook';
import { useLobbySocket } from '../../infrastructure/lobby-dependencies.context';
import { RoundSessionStorage } from '../../infrastructure/round-session.storage';
import { LobbySocket } from '@/features/lobby/application/ports/lobby-socket.port';
import { Player } from '@/features/lobby/domain/entities/player.entity';
import { PlayerRoleType } from '@/features/lobby/domain/models/player.model';
import { RoundSession } from '@/features/lobby/domain/models/round-session.model';

vi.mock('../../infrastructure/lobby-dependencies.context', () => ({
  useLobbySocket: vi.fn(),
}));

vi.mock('../../infrastructure/round-session.storage', () => ({
  RoundSessionStorage: {
    clear: vi.fn(),
  },
}));

type FakeLobbySocketType = LobbySocket & {
  _emit: (event: string, data?: unknown) => void;
  _getCleanups: (event: string) => Array<ReturnType<typeof vi.fn>>;
};

function createFakeLobbySocket(): FakeLobbySocketType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlers: Record<string, Array<{ callback: any; cleanup: ReturnType<typeof vi.fn> }>> = {
    connect: [],
    'lobby-updated': [],
    'round-started': [],
    'card-changed': [],
    'guess-result': [],
    error: [],
    'round-ended': [],
  };

  const socket = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    joinLobby: vi.fn(),
    startRound: vi.fn(),
    nextCard: vi.fn(),
    submitGuess: vi.fn(),
    endRound: vi.fn(),

    onConnect: vi.fn((handler: () => void) => {
      const cleanup = vi.fn();
      handlers['connect'].push({ callback: handler, cleanup });
      return cleanup;
    }),

    onLobbyUpdated: vi.fn((handler: (players: Player[]) => void) => {
      const cleanup = vi.fn();
      handlers['lobby-updated'].push({ callback: handler, cleanup });
      return cleanup;
    }),

    onRoundStarted: vi.fn((handler: (session: RoundSession) => void) => {
      const cleanup = vi.fn();
      handlers['round-started'].push({ callback: handler, cleanup });
      return cleanup;
    }),

    onCardChanged: vi.fn((handler: (session: RoundSession) => void) => {
      const cleanup = vi.fn();
      handlers['card-changed'].push({ callback: handler, cleanup });
      return cleanup;
    }),

    onGuessResult: vi.fn((handler: (result: { correct: boolean }) => void) => {
      const cleanup = vi.fn();
      handlers['guess-result'].push({ callback: handler, cleanup });
      return cleanup;
    }),

    onError: vi.fn((handler: (error: { message: string }) => void) => {
      const cleanup = vi.fn();
      handlers['error'].push({ callback: handler, cleanup });
      return cleanup;
    }),

    onRoundEnded: vi.fn((handler: () => void) => {
      const cleanup = vi.fn();
      handlers['round-ended'].push({ callback: handler, cleanup });
      return cleanup;
    }),

    // Helper para tests: disparar un evento manualmente
    _emit: (event: string, data?: unknown) => {
      const eventHandlers = handlers[event];
      if (eventHandlers) {
        eventHandlers.forEach(({ callback }) => {
          callback(data);
        });
      }
    },

    // Helper para tests: obtener los cleanups registrados
    _getCleanups: (event: string) => {
      return handlers[event]?.map(({ cleanup }) => cleanup) || [];
    },
  };

  return socket as FakeLobbySocketType;
}

describe('useLobby', () => {
  let fakeLobbySocket: FakeLobbySocketType;

  beforeEach(() => {
    vi.clearAllMocks();
    fakeLobbySocket = createFakeLobbySocket();
    vi.mocked(useLobbySocket).mockReturnValue(fakeLobbySocket as unknown as LobbySocket);
  });

  it('should initialize with empty players, null roundSession, null guessResult, false isConnected, and false roundEnded', () => {
    const { result } = renderHook(() => useLobby({ myRole: null }));

    expect(result.current.players).toEqual([]);
    expect(result.current.roundSession).toBeNull();
    expect(result.current.guessResult).toBeNull();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.roundEnded).toBe(false);
  });

  it('should set isConnected to true when onConnect event fires', () => {
    const { result } = renderHook(() => useLobby({ myRole: null }));

    expect(result.current.isConnected).toBe(false);

    // Disparar el evento connect manualmente
    act(() => {
      fakeLobbySocket._emit('connect');
    });

    expect(result.current.isConnected).toBe(true);
  });

  it('should update players when onLobbyUpdated event fires', () => {
    const { result } = renderHook(() => useLobby({ myRole: null }));

    const players: Player[] = [
      Player.create('p1', 'Alice', PlayerRoleType.Describer),
      Player.create('p2', 'Bob', PlayerRoleType.Guesser),
    ];

    act(() => {
      fakeLobbySocket._emit('lobby-updated', players);
    });

    expect(result.current.players).toEqual(players);
  });

  it('should update roundSession when onRoundStarted event fires', () => {
    const { result } = renderHook(() => useLobby({ myRole: null }));

    const session: RoundSession = {
      startAt: 1000,
      durationSeconds: 60,
    };

    act(() => {
      fakeLobbySocket._emit('round-started', session);
    });

    expect(result.current.roundSession).toEqual(session);
  });

  it('should update roundSession when onCardChanged event fires', () => {
    const { result } = renderHook(() => useLobby({ myRole: null }));

    const session: RoundSession = {
      startAt: 2000,
      durationSeconds: 60,
    };

    act(() => {
      fakeLobbySocket._emit('card-changed', session);
    });

    expect(result.current.roundSession).toEqual(session);
  });

  it('should update guessResult when onGuessResult event fires', () => {
    const { result } = renderHook(() => useLobby({ myRole: null }));

    act(() => {
      fakeLobbySocket._emit('guess-result', { correct: true });
    });

    expect(result.current.guessResult).toEqual({ correct: true });
  });

  it('should reset guessResult to null when onRoundStarted event fires', () => {
    const { result } = renderHook(() => useLobby({ myRole: null }));

    // Primero establecer un guessResult
    act(() => {
      fakeLobbySocket._emit('guess-result', { correct: false });
    });

    expect(result.current.guessResult).toEqual({ correct: false });

    // Luego disparar round-started que debe resetear guessResult
    const session: RoundSession = {
      startAt: 1000,
      durationSeconds: 60,
    };

    act(() => {
      fakeLobbySocket._emit('round-started', session);
    });

    expect(result.current.guessResult).toBeNull();
    expect(result.current.roundSession).toEqual(session);
  });

  it('should reset guessResult to null when onCardChanged event fires', () => {
    const { result } = renderHook(() => useLobby({ myRole: null }));

    // Primero establecer un guessResult
    act(() => {
      fakeLobbySocket._emit('guess-result', { correct: true });
    });

    expect(result.current.guessResult).toEqual({ correct: true });

    // Luego disparar card-changed que debe resetear guessResult
    const session: RoundSession = {
      startAt: 2000,
      durationSeconds: 60,
    };

    act(() => {
      fakeLobbySocket._emit('card-changed', session);
    });

    expect(result.current.guessResult).toBeNull();
    expect(result.current.roundSession).toEqual(session);
  });

  it('should reset roundEnded to false when round-started is received after round-ended', () => {
    const { result } = renderHook(() => useLobby({ myRole: null }));

    // Primero disparar round-ended
    act(() => {
      fakeLobbySocket._emit('round-ended');
    });

    expect(result.current.roundEnded).toBe(true);

    // Luego disparar round-started que debe resetear roundEnded a false
    const session: RoundSession = {
      startAt: 1000,
      durationSeconds: 60,
    };

    act(() => {
      fakeLobbySocket._emit('round-started', session);
    });

    expect(result.current.roundEnded).toBe(false);
    expect(result.current.roundSession).toEqual(session);
  });

  it('should preserve myRole from options', () => {
    const { result } = renderHook(() => useLobby({ myRole: PlayerRoleType.Describer }));

    expect(result.current.myRole).toBe(PlayerRoleType.Describer);
  });

  it('should call socket.startRound when startRound() is called', () => {
    const { result } = renderHook(() => useLobby({ myRole: null }));

    act(() => {
      result.current.startRound(120);
    });

    expect(fakeLobbySocket.startRound).toHaveBeenCalledWith(120);
  });

  it('should call socket.nextCard when nextCard() is called', () => {
    const { result } = renderHook(() => useLobby({ myRole: null }));

    act(() => {
      result.current.nextCard();
    });

    expect(fakeLobbySocket.nextCard).toHaveBeenCalled();
  });

  it('should call socket.submitGuess when submitGuess() is called', () => {
    const { result } = renderHook(() => useLobby({ myRole: null }));

    act(() => {
      result.current.submitGuess('apple');
    });

    expect(fakeLobbySocket.submitGuess).toHaveBeenCalledWith('apple');
  });

  it('should call socket.endRound when endRound() is called', () => {
    const { result } = renderHook(() => useLobby({ myRole: null }));

    act(() => {
      result.current.endRound();
    });

    expect(fakeLobbySocket.endRound).toHaveBeenCalled();
  });

  it('should set roundEnded to true when round-ended event is received', () => {
    const { result } = renderHook(() => useLobby({ myRole: null }));

    expect(result.current.roundEnded).toBe(false);

    act(() => {
      fakeLobbySocket._emit('round-ended');
    });

    expect(result.current.roundEnded).toBe(true);
  });

  it('should clear RoundSessionStorage when round-ended is received', () => {
    renderHook(() => useLobby({ myRole: null }));

    act(() => {
      fakeLobbySocket._emit('round-ended');
    });

    expect(RoundSessionStorage.clear).toHaveBeenCalled();
  });

  it('should not clear LobbyPlayerSession when round-ended is received', () => {
    const { result } = renderHook(() => useLobby({ myRole: null }));

    act(() => {
      fakeLobbySocket._emit('round-ended');
    });

    expect(RoundSessionStorage.clear).toHaveBeenCalled();

    expect(result.current.roundEnded).toBe(true);
  });

  describe('cleanup', () => {
    it('should call cleanup functions on unmount', () => {
      const { unmount } = renderHook(() => useLobby({ myRole: null }));

      // Obtener las funciones de cleanup registradas
      const connectCleanups = fakeLobbySocket._getCleanups('connect');
      const lobbyUpdatedCleanups = fakeLobbySocket._getCleanups('lobby-updated');
      const roundStartedCleanups = fakeLobbySocket._getCleanups('round-started');
      const cardChangedCleanups = fakeLobbySocket._getCleanups('card-changed');
      const guessResultCleanups = fakeLobbySocket._getCleanups('guess-result');
      const roundEndedCleanups = fakeLobbySocket._getCleanups('round-ended');

      // Verificar que los handlers fueron registrados
      expect(connectCleanups.length).toBeGreaterThan(0);
      expect(lobbyUpdatedCleanups.length).toBeGreaterThan(0);
      expect(roundStartedCleanups.length).toBeGreaterThan(0);
      expect(cardChangedCleanups.length).toBeGreaterThan(0);
      expect(guessResultCleanups.length).toBeGreaterThan(0);
      expect(roundEndedCleanups.length).toBeGreaterThan(0);

      // Desmontar el hook
      unmount();

      // Verificar que se llamaron los cleanups
      connectCleanups.forEach((cleanup) => {
        expect(cleanup).toHaveBeenCalled();
      });
      lobbyUpdatedCleanups.forEach((cleanup) => {
        expect(cleanup).toHaveBeenCalled();
      });
      roundStartedCleanups.forEach((cleanup) => {
        expect(cleanup).toHaveBeenCalled();
      });
      cardChangedCleanups.forEach((cleanup) => {
        expect(cleanup).toHaveBeenCalled();
      });
      guessResultCleanups.forEach((cleanup) => {
        expect(cleanup).toHaveBeenCalled();
      });
      roundEndedCleanups.forEach((cleanup) => {
        expect(cleanup).toHaveBeenCalled();
      });
    });

    it('should not register duplicate handlers on remount', () => {
      const { unmount } = renderHook(() => useLobby({ myRole: null }));

      // Primera montura: verificar que hay 1 handler registrado
      let connectCleanups = fakeLobbySocket._getCleanups('connect');
      expect(connectCleanups.length).toBe(1);

      // Remontar: first cleanup, luego re-render
      unmount();
      fakeLobbySocket = createFakeLobbySocket();
      vi.mocked(useLobbySocket).mockReturnValue(fakeLobbySocket);

      renderHook(() => useLobby({ myRole: null }));
      connectCleanups = fakeLobbySocket._getCleanups('connect');
      expect(connectCleanups.length).toBe(1);
    });
  });
});
