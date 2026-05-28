import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { DescriberPage } from './DescriberPage';
import { useLobby } from '@/features/lobby/ui/hooks';
import { useServerSyncedCountdown } from '@/shared/hooks/use-server-synced-countdown.hook';
import { LobbyPlayerSession } from '@/features/lobby/infrastructure/lobby-player.session';
import { RoundSessionStorage } from '@/features/lobby/infrastructure/round-session.storage';

// Mock de los hooks
vi.mock('../../hooks/use-lobby.hook', () => ({
  useLobby: vi.fn(),
}));

vi.mock('@/shared/hooks/use-server-synced-countdown.hook', () => ({
  useServerSyncedCountdown: vi.fn(),
}));

vi.mock('@/features/lobby/infrastructure/lobby-dependencies.context', () => ({
  useRejoinRound: vi.fn(),
}));

vi.mock('@/features/lobby/infrastructure/lobby-player.session', () => ({
  LobbyPlayerSession: {
    load: vi.fn(),
  },
}));

vi.mock('@/features/lobby/infrastructure/round-session.storage', () => ({
  RoundSessionStorage: {
    load: vi.fn(),
    clear: vi.fn(),
  },
}));

import { useRejoinRound } from '@/features/lobby/infrastructure/lobby-dependencies.context';

describe('DescriberPage', () => {
  const mockRoundSession = {
    startAt: Date.now(),
    durationSeconds: 60,
    card: {
      id: '1',
      word: 'marte',
      bannedWords: ['planeta', 'rojo', 'espacio', 'nasa'],
    },
  };

  const mockStartRound = vi.fn();
  const mockEndRound = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(LobbyPlayerSession.load).mockReturnValue(null);
    vi.mocked(RoundSessionStorage.load).mockReturnValue(null);

    vi.mocked(useRejoinRound).mockReturnValue({ execute: vi.fn() } as unknown as ReturnType<
      typeof useRejoinRound
    >);

    vi.mocked(useLobby).mockReturnValue({
      players: [],
      roundSession: mockRoundSession,
      myRole: 'describer',
      isConnected: true,
      guessResult: null,
      wordGuessed: null,
      roundEnded: false,
      startRound: mockStartRound,
      nextCard: vi.fn(),
      submitGuess: vi.fn(),
      endRound: mockEndRound,
    });

    vi.mocked(useServerSyncedCountdown).mockReturnValue({
      remainingSeconds: 45,
      formatted: '00:45',
    });
  });

  it('should redirect to / when roundSession is not in location.state', async () => {
    render(
      <MemoryRouter initialEntries={['/round/describe']}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/round/describe" element={<DescriberPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  it('should render timer and card when roundSession is provided', () => {
    render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/round/describe', state: { roundSession: mockRoundSession } },
        ]}
      >
        <Routes>
          <Route path="/round/describe" element={<DescriberPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('00:45')).toBeInTheDocument();
    expect(screen.getByText('MARTE')).toBeInTheDocument();
    expect(screen.getByText('planeta')).toBeInTheDocument();
  });

  it('should render SIGUIENTE button', () => {
    render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/round/describe', state: { roundSession: mockRoundSession } },
        ]}
      >
        <Routes>
          <Route path="/round/describe" element={<DescriberPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument();
  });

  it('should call nextCard when SIGUIENTE button is clicked', async () => {
    const user = userEvent.setup();
    const mockNextCard = vi.fn();

    vi.mocked(useLobby).mockReturnValue({
      players: [],
      roundSession: mockRoundSession,
      myRole: 'describer',
      isConnected: true,
      guessResult: null,
      wordGuessed: null,
      roundEnded: false,
      startRound: vi.fn(),
      nextCard: mockNextCard,
      submitGuess: vi.fn(),
      endRound: vi.fn(),
    });

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/round/describe', state: { roundSession: mockRoundSession } },
        ]}
      >
        <Routes>
          <Route path="/round/describe" element={<DescriberPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const button = screen.getByRole('button', { name: /siguiente/i });
    await user.click(button);

    expect(mockNextCard).toHaveBeenCalledTimes(1);
  });

  it('should pass correct roundSession to countdown', () => {
    render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/round/describe', state: { roundSession: mockRoundSession } },
        ]}
      >
        <Routes>
          <Route path="/round/describe" element={<DescriberPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(useServerSyncedCountdown).toHaveBeenCalledWith(
      expect.objectContaining({
        startAt: mockRoundSession.startAt,
        durationSeconds: mockRoundSession.durationSeconds,
      }),
    );
  });

  it('should pass onExpire callback to countdown that calls lobby.endRound', () => {
    let capturedOnExpire: (() => void) | undefined;
    vi.mocked(useServerSyncedCountdown).mockImplementation((opts) => {
      capturedOnExpire = opts.onExpire;
      return { remainingSeconds: 45, formatted: '00:45' };
    });

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/round/describe', state: { roundSession: mockRoundSession } },
        ]}
      >
        <Routes>
          <Route path="/round/describe" element={<DescriberPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(capturedOnExpire).toBeDefined();
    capturedOnExpire!();
    expect(mockEndRound).toHaveBeenCalledTimes(1);
  });

  it('should show round ended state when roundEnded is true', () => {
    vi.mocked(useLobby).mockReturnValue({
      players: [],
      roundSession: mockRoundSession,
      myRole: 'describer',
      isConnected: true,
      guessResult: null,
      wordGuessed: null,
      roundEnded: true,
      startRound: mockStartRound,
      nextCard: vi.fn(),
      submitGuess: vi.fn(),
      endRound: mockEndRound,
    });

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/round/describe', state: { roundSession: mockRoundSession } },
        ]}
      >
        <Routes>
          <Route path="/round/describe" element={<DescriberPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/ronda terminada/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar nueva ronda/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /siguiente/i })).not.toBeInTheDocument();
  });

  it('should call startRound when new round button is clicked', async () => {
    const user = userEvent.setup();

    vi.mocked(useLobby).mockReturnValue({
      players: [],
      roundSession: mockRoundSession,
      myRole: 'describer',
      isConnected: true,
      guessResult: null,
      wordGuessed: null,
      roundEnded: true,
      startRound: mockStartRound,
      nextCard: vi.fn(),
      submitGuess: vi.fn(),
      endRound: mockEndRound,
    });

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/round/describe', state: { roundSession: mockRoundSession } },
        ]}
      >
        <Routes>
          <Route path="/round/describe" element={<DescriberPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const button = screen.getByRole('button', { name: /iniciar nueva ronda/i });
    await user.click(button);

    expect(mockStartRound).toHaveBeenCalledWith(mockRoundSession.durationSeconds);
  });

  it('should return to normal view when roundEnded goes back to false', () => {
    const { rerender } = render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/round/describe', state: { roundSession: mockRoundSession } },
        ]}
      >
        <Routes>
          <Route path="/round/describe" element={<DescriberPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Simular que llega round-ended
    vi.mocked(useLobby).mockReturnValue({
      players: [],
      roundSession: null,
      myRole: 'describer',
      isConnected: true,
      guessResult: null,
      wordGuessed: null,
      roundEnded: true,
      startRound: mockStartRound,
      nextCard: vi.fn(),
      submitGuess: vi.fn(),
      endRound: mockEndRound,
    });

    rerender(
      <MemoryRouter
        initialEntries={[
          { pathname: '/round/describe', state: { roundSession: mockRoundSession } },
        ]}
      >
        <Routes>
          <Route path="/round/describe" element={<DescriberPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/ronda terminada/i)).toBeInTheDocument();

    // Simular que llega round-started y roundEnded vuelve a false
    const newSession = { ...mockRoundSession, startAt: Date.now() + 5000 };
    vi.mocked(useLobby).mockReturnValue({
      players: [],
      roundSession: newSession,
      myRole: 'describer',
      isConnected: true,
      guessResult: null,
      wordGuessed: null,
      roundEnded: false,
      startRound: mockStartRound,
      nextCard: vi.fn(),
      submitGuess: vi.fn(),
      endRound: mockEndRound,
    });

    rerender(
      <MemoryRouter
        initialEntries={[
          { pathname: '/round/describe', state: { roundSession: mockRoundSession } },
        ]}
      >
        <Routes>
          <Route path="/round/describe" element={<DescriberPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText(/ronda terminada/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument();
  });

  it('should reconnect using session data when location.state is null', () => {
    const mockPlayerData = {
      playerId: 'player-123',
      playerName: 'Alice',
      role: 'describer' as const,
      durationSeconds: 60,
      lobbyCode: 'ABC123',
    };
    const mockExecute = vi.fn();

    vi.mocked(LobbyPlayerSession.load).mockReturnValue(mockPlayerData);
    vi.mocked(RoundSessionStorage.load).mockReturnValue(mockRoundSession);
    vi.mocked(useRejoinRound).mockReturnValue({ execute: mockExecute } as unknown as ReturnType<
      typeof useRejoinRound
    >);

    render(
      // Sin state → simula recarga de página
      <MemoryRouter initialEntries={[{ pathname: '/round/describe', state: null }]}>
        <Routes>
          <Route path="/round/describe" element={<DescriberPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(mockExecute).toHaveBeenCalledWith(
      mockPlayerData.lobbyCode,
      mockPlayerData.playerName,
      mockPlayerData.role,
      mockPlayerData.playerId,
    );
  });

  it('should update card when lobby.roundSession changes', () => {
    const { rerender } = render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/round/describe', state: { roundSession: mockRoundSession } },
        ]}
      >
        <Routes>
          <Route path="/round/describe" element={<DescriberPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('MARTE')).toBeInTheDocument();

    const newCard = {
      startAt: Date.now() + 1000,
      durationSeconds: 60,
      card: {
        id: '2',
        word: 'tierra',
        bannedWords: ['planeta', 'mundo', 'roca', 'azul'],
      },
    };

    vi.mocked(useLobby).mockReturnValue({
      players: [],
      roundSession: newCard,
      myRole: 'describer',
      isConnected: true,
      guessResult: null,
      wordGuessed: null,
      roundEnded: false,
      startRound: vi.fn(),
      nextCard: vi.fn(),
      submitGuess: vi.fn(),
      endRound: vi.fn(),
    });

    rerender(
      <MemoryRouter
        initialEntries={[
          { pathname: '/round/describe', state: { roundSession: mockRoundSession } },
        ]}
      >
        <Routes>
          <Route path="/round/describe" element={<DescriberPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('TIERRA')).toBeInTheDocument();
  });

  it('should render exit button', () => {
    render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/round/describe', state: { roundSession: mockRoundSession } },
        ]}
      >
        <Routes>
          <Route path="/round/describe" element={<DescriberPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: /finalizar partida/i })).toBeInTheDocument();
  });

  it('should navigate to waiting room when exit button is clicked', async () => {
    const user = userEvent.setup();
    const mockPlayerData = {
      playerId: 'player-123',
      playerName: 'Alice',
      role: 'describer' as const,
      durationSeconds: 60,
      lobbyCode: 'ABC123',
    };
    vi.mocked(LobbyPlayerSession.load).mockReturnValue(mockPlayerData);

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: '/round/describe', state: { roundSession: mockRoundSession } },
        ]}
      >
        <Routes>
          <Route path="/round/describe" element={<DescriberPage />} />
          <Route path="/lobby/:code" element={<div>Sala de espera</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: /finalizar partida/i }));

    await waitFor(() => {
      expect(screen.getByText('Sala de espera')).toBeInTheDocument();
    });
  });
});
