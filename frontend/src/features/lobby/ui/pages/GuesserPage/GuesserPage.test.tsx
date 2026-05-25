import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { GuesserPage } from './GuesserPage';
import { useLobby } from '../../hooks/use-lobby.hook';
import { useServerSyncedCountdown } from '@/shared/hooks/use-server-synced-countdown.hook';

// Mock de los hooks
vi.mock('../../hooks/use-lobby.hook', () => ({
  useLobby: vi.fn(),
}));

vi.mock('@/shared/hooks/use-server-synced-countdown.hook', () => ({
  useServerSyncedCountdown: vi.fn(),
}));

describe('GuesserPage', () => {
  const mockRoundSession = {
    startAt: Date.now(),
    durationSeconds: 60,
  };

  beforeEach(() => {
    vi.clearAllMocks();

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
    // Wait for navigation to occur
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

    // Verificar que el timer se renderiza
    expect(screen.getByText('00:45')).toBeInTheDocument();

    // Verificar que el formulario se renderiza
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

    expect(useServerSyncedCountdown).toHaveBeenCalledWith({
      startAt: mockRoundSession.startAt,
      durationSeconds: mockRoundSession.durationSeconds,
    });
  });
});
