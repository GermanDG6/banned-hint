import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConnectedWaitingRoom } from './ConnectedWaitingRoom';
import { useLobby } from '@/features/lobby/ui/hooks/use-lobby.hook';
import { useNavigate } from 'react-router-dom';
import { RoundSessionStorage } from '@/features/lobby/infrastructure/round-session.storage';
import { PlayerRoleType } from '@/features/lobby/domain/models/player.model';
import { RoundSession } from '@/features/lobby/domain/models/round-session.model';

// Mock dependencies
vi.mock('@/features/lobby/ui/hooks/use-lobby.hook');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});
vi.mock('@/features/lobby/infrastructure/round-session.storage');

describe('ConnectedWaitingRoom', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;
  let mockSave: ReturnType<typeof vi.fn>;
  let mockRoundSession: RoundSession;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate = vi.fn();
    mockSave = vi.fn();
    mockRoundSession = {
      startAt: Date.now(),
      durationSeconds: 60,
      card: {
        id: 'card-1',
        word: 'test',
        bannedWords: ['word1', 'word2', 'word3', 'word4'],
      },
    };

    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
    (RoundSessionStorage.save as ReturnType<typeof vi.fn>).mockImplementation(mockSave);
  });

  it('should save RoundSession to storage before navigating to describer page', async () => {
    const mockLobby = {
      players: [{ id: 'player-1', name: 'Host', role: PlayerRoleType.Describer }],
      roundSession: mockRoundSession,
      isConnected: true,
      startRound: vi.fn(),
      nextCard: vi.fn(),
      submitGuess: vi.fn(),
      endRound: vi.fn(),
      roundEnded: false,
    };

    (useLobby as ReturnType<typeof vi.fn>).mockReturnValue(mockLobby);

    render(
      <BrowserRouter>
        <ConnectedWaitingRoom
          code="ABC123"
          myRole={PlayerRoleType.Describer}
          durationSeconds={60}
        />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith(mockRoundSession);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/round/describe', {
      state: { roundSession: mockRoundSession },
    });

    // Verify save was called before navigate
    expect(mockSave.mock.invocationCallOrder[0]).toBeLessThan(
      mockNavigate.mock.invocationCallOrder[0],
    );
  });

  it('should save RoundSession to storage before navigating to guesser page', async () => {
    const mockLobby = {
      players: [
        { id: 'player-1', name: 'Host', role: PlayerRoleType.Describer },
        { id: 'player-2', name: 'Guest', role: PlayerRoleType.Guesser },
      ],
      roundSession: mockRoundSession,
      isConnected: true,
      startRound: vi.fn(),
      nextCard: vi.fn(),
      submitGuess: vi.fn(),
      endRound: vi.fn(),
      roundEnded: false,
    };

    (useLobby as ReturnType<typeof vi.fn>).mockReturnValue(mockLobby);

    render(
      <BrowserRouter>
        <ConnectedWaitingRoom code="ABC123" myRole={PlayerRoleType.Guesser} durationSeconds={60} />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith(mockRoundSession);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/round/guess', {
      state: { roundSession: mockRoundSession },
    });

    // Verify save was called before navigate
    expect(mockSave.mock.invocationCallOrder[0]).toBeLessThan(
      mockNavigate.mock.invocationCallOrder[0],
    );
  });

  it('should render lobby code display and player list', () => {
    const mockLobby = {
      players: [
        { id: 'player-1', name: 'Host', role: PlayerRoleType.Describer },
        { id: 'player-2', name: 'Guest', role: PlayerRoleType.Guesser },
      ],
      roundSession: null,
      isConnected: true,
      startRound: vi.fn(),
      nextCard: vi.fn(),
      submitGuess: vi.fn(),
      endRound: vi.fn(),
      roundEnded: false,
    };

    (useLobby as ReturnType<typeof vi.fn>).mockReturnValue(mockLobby);

    render(
      <BrowserRouter>
        <ConnectedWaitingRoom
          code="ABC123"
          myRole={PlayerRoleType.Describer}
          durationSeconds={60}
        />
      </BrowserRouter>,
    );

    // Check that LobbyCodeDisplay is rendered with the code
    expect(
      document.querySelector('[class*="LobbyCodeDisplay"]') || document.body.textContent,
    ).toContain('ABC123');

    // Check that PlayerList is rendered with player names
    expect(document.body.textContent).toContain('Host');
    expect(document.body.textContent).toContain('Guest');
  });

  it('should render start round button only for describer', () => {
    const mockLobby = {
      players: [{ id: 'player-1', name: 'Host', role: PlayerRoleType.Describer }],
      roundSession: null,
      isConnected: true,
      startRound: vi.fn(),
      nextCard: vi.fn(),
      submitGuess: vi.fn(),
      endRound: vi.fn(),
      roundEnded: false,
    };

    (useLobby as ReturnType<typeof vi.fn>).mockReturnValue(mockLobby);

    // Render as Describer
    const { rerender } = render(
      <BrowserRouter>
        <ConnectedWaitingRoom
          code="ABC123"
          myRole={PlayerRoleType.Describer}
          durationSeconds={60}
        />
      </BrowserRouter>,
    );

    const startButton = document.querySelector('button');
    expect(startButton).toBeDefined();

    vi.clearAllMocks();
    (useLobby as ReturnType<typeof vi.fn>).mockReturnValue(mockLobby);

    // Render as Guesser
    rerender(
      <BrowserRouter>
        <ConnectedWaitingRoom code="ABC123" myRole={PlayerRoleType.Guesser} durationSeconds={60} />
      </BrowserRouter>,
    );

    const buttons = document.querySelectorAll('button');
    const hasStartButton = Array.from(buttons).some(
      (btn) => btn.textContent?.includes('Iniciar ronda') || false,
    );
    expect(hasStartButton).toBe(false);
  });

  it('should disable start round button when not connected', () => {
    const mockLobby = {
      players: [{ id: 'player-1', name: 'Host', role: PlayerRoleType.Describer }],
      roundSession: null,
      isConnected: false,
      startRound: vi.fn(),
      nextCard: vi.fn(),
      submitGuess: vi.fn(),
      endRound: vi.fn(),
      roundEnded: false,
    };

    (useLobby as ReturnType<typeof vi.fn>).mockReturnValue(mockLobby);

    render(
      <BrowserRouter>
        <ConnectedWaitingRoom
          code="ABC123"
          myRole={PlayerRoleType.Describer}
          durationSeconds={60}
        />
      </BrowserRouter>,
    );

    const buttons = document.querySelectorAll('button');
    const startButton = Array.from(buttons).find(
      (btn) => btn.textContent?.includes('Iniciar ronda') || false,
    ) as HTMLButtonElement;

    expect(startButton?.disabled).toBe(true);
  });

  it('should call startRound with correct duration when button is clicked', async () => {
    const mockStartRound = vi.fn();
    const mockLobby = {
      players: [{ id: 'player-1', name: 'Host', role: PlayerRoleType.Describer }],
      roundSession: null,
      isConnected: true,
      startRound: mockStartRound,
      nextCard: vi.fn(),
      submitGuess: vi.fn(),
      endRound: vi.fn(),
      roundEnded: false,
    };

    (useLobby as ReturnType<typeof vi.fn>).mockReturnValue(mockLobby);

    render(
      <BrowserRouter>
        <ConnectedWaitingRoom
          code="ABC123"
          myRole={PlayerRoleType.Describer}
          durationSeconds={120}
        />
      </BrowserRouter>,
    );

    const buttons = document.querySelectorAll('button');
    const startButton = Array.from(buttons).find(
      (btn) => btn.textContent?.includes('Iniciar ronda') || false,
    ) as HTMLElement;

    const user = await import('@testing-library/user-event').then((m) => m.default.setup());
    await user.click(startButton);

    expect(mockStartRound).toHaveBeenCalledWith(120);
  });
});
