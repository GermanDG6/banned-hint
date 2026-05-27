import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { GuesserPage } from './GuesserPage';
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

describe('GuesserPage', () => {
  const mockRoundSession = {
    startAt: Date.now(),
    durationSeconds: 60,
  };

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
      myRole: 'guesser',
      isConnected: true,
      guessResult: null,
      roundEnded: false,
      startRound: vi.fn(),
      nextCard: vi.fn(),
      submitGuess: vi.fn(),
      endRound: vi.fn(),
    });

    vi.mocked(useServerSyncedCountdown).mockReturnValue({
      remainingSeconds: 45,
      formatted: '00:45',
    });
  });

  it('should redirect to / when roundSession is not in location.state', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/round/guess']}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/round/guess" element={<GuesserPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(container).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  it('should render timer and form when roundSession is provided', () => {
    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/round/guess', state: { roundSession: mockRoundSession } }]}
      >
        <Routes>
          <Route path="/round/guess" element={<GuesserPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('00:45')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/escribe tu intento/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument();
  });

  it('should call submitGuess when form is submitted', async () => {
    const user = userEvent.setup();
    const mockSubmitGuess = vi.fn();

    vi.mocked(useLobby).mockReturnValue({
      players: [],
      roundSession: mockRoundSession,
      myRole: 'guesser',
      isConnected: true,
      guessResult: null,
      roundEnded: false,
      startRound: vi.fn(),
      nextCard: vi.fn(),
      submitGuess: mockSubmitGuess,
      endRound: vi.fn(),
    });

    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/round/guess', state: { roundSession: mockRoundSession } }]}
      >
        <Routes>
          <Route path="/round/guess" element={<GuesserPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const input = screen.getByPlaceholderText(/escribe tu intento/i);
    const button = screen.getByRole('button', { name: /enviar/i });

    await user.type(input, 'manzana');
    await user.click(button);

    expect(mockSubmitGuess).toHaveBeenCalledWith('manzana');
  });

  it('should display correct feedback when guessResult is correct', () => {
    vi.mocked(useLobby).mockReturnValue({
      players: [],
      roundSession: mockRoundSession,
      myRole: 'guesser',
      isConnected: true,
      guessResult: { correct: true },
      roundEnded: false,
      startRound: vi.fn(),
      nextCard: vi.fn(),
      submitGuess: vi.fn(),
      endRound: vi.fn(),
    });

    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/round/guess', state: { roundSession: mockRoundSession } }]}
      >
        <Routes>
          <Route path="/round/guess" element={<GuesserPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/✅ ¡correcto!/i)).toBeInTheDocument();
  });

  it('should display incorrect feedback when guessResult is incorrect', () => {
    vi.mocked(useLobby).mockReturnValue({
      players: [],
      roundSession: mockRoundSession,
      myRole: 'guesser',
      isConnected: true,
      guessResult: { correct: false },
      roundEnded: false,
      startRound: vi.fn(),
      nextCard: vi.fn(),
      submitGuess: vi.fn(),
      endRound: vi.fn(),
    });

    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/round/guess', state: { roundSession: mockRoundSession } }]}
      >
        <Routes>
          <Route path="/round/guess" element={<GuesserPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/❌ inténtalo de nuevo/i)).toBeInTheDocument();
  });

  it('should pass correct roundSession to countdown', () => {
    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/round/guess', state: { roundSession: mockRoundSession } }]}
      >
        <Routes>
          <Route path="/round/guess" element={<GuesserPage />} />
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

  it('should show waiting message when roundEnded is true', () => {
    vi.mocked(useLobby).mockReturnValue({
      players: [],
      roundSession: null,
      myRole: 'guesser',
      isConnected: true,
      guessResult: null,
      roundEnded: true,
      startRound: vi.fn(),
      nextCard: vi.fn(),
      submitGuess: vi.fn(),
      endRound: vi.fn(),
    });

    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/round/guess', state: { roundSession: mockRoundSession } }]}
      >
        <Routes>
          <Route path="/round/guess" element={<GuesserPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/esperando nueva ronda/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/escribe tu intento/i)).not.toBeInTheDocument();
  });

  it('should return to normal view when roundEnded goes back to false', () => {
    const { rerender } = render(
      <MemoryRouter
        initialEntries={[{ pathname: '/round/guess', state: { roundSession: mockRoundSession } }]}
      >
        <Routes>
          <Route path="/round/guess" element={<GuesserPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Simular round-ended
    vi.mocked(useLobby).mockReturnValue({
      players: [],
      roundSession: null,
      myRole: 'guesser',
      isConnected: true,
      guessResult: null,
      roundEnded: true,
      startRound: vi.fn(),
      nextCard: vi.fn(),
      submitGuess: vi.fn(),
      endRound: vi.fn(),
    });

    rerender(
      <MemoryRouter
        initialEntries={[{ pathname: '/round/guess', state: { roundSession: mockRoundSession } }]}
      >
        <Routes>
          <Route path="/round/guess" element={<GuesserPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/esperando nueva ronda/i)).toBeInTheDocument();

    // Simular round-started → roundEnded vuelve a false
    const newSession = { ...mockRoundSession, startAt: Date.now() + 5000 };
    vi.mocked(useLobby).mockReturnValue({
      players: [],
      roundSession: newSession,
      myRole: 'guesser',
      isConnected: true,
      guessResult: null,
      roundEnded: false,
      startRound: vi.fn(),
      nextCard: vi.fn(),
      submitGuess: vi.fn(),
      endRound: vi.fn(),
    });

    rerender(
      <MemoryRouter
        initialEntries={[{ pathname: '/round/guess', state: { roundSession: mockRoundSession } }]}
      >
        <Routes>
          <Route path="/round/guess" element={<GuesserPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByText(/esperando nueva ronda/i)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText(/escribe tu intento/i)).toBeInTheDocument();
  });

  it('should reconnect using session data when location.state is null', () => {
    const mockPlayerData = {
      playerId: 'player-456',
      playerName: 'Bob',
      role: 'guesser' as const,
      durationSeconds: 60,
      lobbyCode: 'XYZ789',
    };
    const mockExecute = vi.fn();

    vi.mocked(LobbyPlayerSession.load).mockReturnValue(mockPlayerData);
    vi.mocked(RoundSessionStorage.load).mockReturnValue(mockRoundSession);
    vi.mocked(useRejoinRound).mockReturnValue({ execute: mockExecute } as unknown as ReturnType<
      typeof useRejoinRound
    >);

    render(
      <MemoryRouter initialEntries={[{ pathname: '/round/guess', state: null }]}>
        <Routes>
          <Route path="/round/guess" element={<GuesserPage />} />
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

  it('should render exit button', () => {
    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/round/guess', state: { roundSession: mockRoundSession } }]}
      >
        <Routes>
          <Route path="/round/guess" element={<GuesserPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('button', { name: /finalizar partida/i })).toBeInTheDocument();
  });

  it('should navigate to waiting room when exit button is clicked', async () => {
    const user = userEvent.setup();
    const mockPlayerData = {
      playerId: 'player-456',
      playerName: 'Bob',
      role: 'guesser' as const,
      durationSeconds: 60,
      lobbyCode: 'XYZ789',
    };
    vi.mocked(LobbyPlayerSession.load).mockReturnValue(mockPlayerData);

    render(
      <MemoryRouter
        initialEntries={[{ pathname: '/round/guess', state: { roundSession: mockRoundSession } }]}
      >
        <Routes>
          <Route path="/round/guess" element={<GuesserPage />} />
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
