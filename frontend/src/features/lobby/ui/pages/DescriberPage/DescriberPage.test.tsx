import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { DescriberPage } from './DescriberPage';
import { useLobby } from '../../hooks/use-lobby.hook';
import { useServerSyncedCountdown } from '@/shared/hooks/use-server-synced-countdown.hook';

// Mock de los hooks
vi.mock('../../hooks/use-lobby.hook', () => ({
  useLobby: vi.fn(),
}));

vi.mock('@/shared/hooks/use-server-synced-countdown.hook', () => ({
  useServerSyncedCountdown: vi.fn(),
}));

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

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useLobby).mockReturnValue({
      players: [],
      roundSession: mockRoundSession,
      myRole: 'describer',
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
    render(
      <MemoryRouter initialEntries={['/round/describe']}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/round/describe" element={<DescriberPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Wait for navigation to occur
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

    // Verificar que el timer se renderiza
    expect(screen.getByText('00:45')).toBeInTheDocument();

    // Verificar que la tarjeta se renderiza
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

    expect(useServerSyncedCountdown).toHaveBeenCalledWith({
      startAt: mockRoundSession.startAt,
      durationSeconds: mockRoundSession.durationSeconds,
    });
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

  it('should render BANNED HINT header', () => {
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

    expect(screen.getByText('BANNED HINT')).toBeInTheDocument();
  });
});
