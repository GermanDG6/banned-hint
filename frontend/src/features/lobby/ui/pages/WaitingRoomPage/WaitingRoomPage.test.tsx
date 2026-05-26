import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WaitingRoomPage } from './WaitingRoomPage';
import {
  useJoinLobby,
  useLobbySocket,
} from '@/features/lobby/infrastructure/lobby-dependencies.context';
import { LobbyPlayerSession } from '@/features/lobby/infrastructure/lobby-player.session';
import * as ReactRouterDom from 'react-router-dom';
import { Player } from '@/features/lobby/domain/entities/player.entity.ts';
import { PlayerRoleType } from '@/features/lobby/domain/models/player.model.ts';

// Mock dependencies
vi.mock('@/features/lobby/infrastructure/lobby-dependencies.context');
vi.mock('@/features/lobby/infrastructure/lobby-player.session');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof ReactRouterDom>('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useLocation: vi.fn(),
  };
});

const noopCleanup = () => {};

const mockSocket = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  joinLobby: vi.fn(),
  startRound: vi.fn(),
  nextCard: vi.fn(),
  submitGuess: vi.fn(),
  endRound: vi.fn(),
  onConnect: vi.fn().mockReturnValue(noopCleanup),
  onLobbyUpdated: vi.fn().mockReturnValue(noopCleanup),
  onRoundStarted: vi.fn().mockReturnValue(noopCleanup),
  onCardChanged: vi.fn().mockReturnValue(noopCleanup),
  onGuessResult: vi.fn().mockReturnValue(noopCleanup),
  onError: vi.fn().mockReturnValue(noopCleanup),
  onRoundEnded: vi.fn().mockReturnValue(noopCleanup),
};

describe('WaitingRoomPage', () => {
  let mockJoinLobby: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Restore noop cleanups after clearAllMocks
    mockSocket.onConnect.mockReturnValue(noopCleanup);
    mockSocket.onLobbyUpdated.mockReturnValue(noopCleanup);
    mockSocket.onRoundStarted.mockReturnValue(noopCleanup);
    mockSocket.onCardChanged.mockReturnValue(noopCleanup);
    mockSocket.onGuessResult.mockReturnValue(noopCleanup);
    mockSocket.onError.mockReturnValue(noopCleanup);
    mockSocket.onRoundEnded.mockReturnValue(noopCleanup);

    (useLobbySocket as ReturnType<typeof vi.fn>).mockReturnValue(mockSocket);

    mockJoinLobby = vi.fn().mockReturnValue({
      execute: vi.fn().mockResolvedValue(undefined),
    });

    (useJoinLobby as ReturnType<typeof vi.fn>).mockReturnValue(mockJoinLobby);

    (LobbyPlayerSession.load as ReturnType<typeof vi.fn>).mockReturnValue(null);
    (LobbyPlayerSession.save as ReturnType<typeof vi.fn>).mockImplementation(() => {});

    // Mock useParams and useLocation
    (ReactRouterDom.useParams as ReturnType<typeof vi.fn>).mockReturnValue({ code: 'ABC123' });
    (ReactRouterDom.useLocation as ReturnType<typeof vi.fn>).mockReturnValue({
      state: null,
      pathname: '/lobby/ABC123',
    });
  });

  it('should render JoinLobbyForm when no state and no session data', async () => {
    render(
      <MemoryRouter initialEntries={['/lobby/ABC123']}>
        <WaitingRoomPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Unirse a Sala/i })).toBeVisible();
    });
  });

  it('should call LobbyPlayerSession.save with lobbyCode when host joins successfully', async () => {
    const mockExecute = vi.fn().mockResolvedValue(undefined);
    (useJoinLobby as ReturnType<typeof vi.fn>).mockReturnValue({
      execute: mockExecute,
    });

    const hostState = {
      playerId: 'host-id',
      role: 'describer' as const,
      playerName: 'Host',
      durationSeconds: 60,
    };

    (ReactRouterDom.useLocation as ReturnType<typeof vi.fn>).mockReturnValue({
      state: hostState,
      pathname: '/lobby/ABC123',
    });

    render(
      <MemoryRouter initialEntries={['/lobby/ABC123']}>
        <WaitingRoomPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(LobbyPlayerSession.save).toHaveBeenCalledWith({
        playerId: 'host-id',
        playerName: 'Host',
        role: 'describer',
        durationSeconds: 60,
        lobbyCode: 'ABC123',
      });
    });
  });

  it('should call LobbyPlayerSession.save with lobbyCode when guest joins successfully', async () => {
    const validUUID = '550e8400-e29b-41d4-a716-446655440001';
    const mockGuest = Player.create('Guest Player', PlayerRoleType.Guesser, validUUID);
    const mockExecute = vi.fn().mockResolvedValue(mockGuest);
    (useJoinLobby as ReturnType<typeof vi.fn>).mockReturnValue({
      execute: mockExecute,
    });

    render(
      <MemoryRouter initialEntries={['/lobby/ABC123']}>
        <WaitingRoomPage />
      </MemoryRouter>,
    );

    const form = screen.getByRole('heading', { name: /Unirse a Sala/i });
    expect(form).toBeVisible();

    const input = screen.getByLabelText(/nombre/i);
    const submitButton = screen.getByRole('button', { name: /unirse/i });

    const user = userEvent.setup();
    await user.type(input, 'Guest Player');
    await user.click(submitButton);

    await waitFor(() => {
      expect(LobbyPlayerSession.save).toHaveBeenCalledWith(
        expect.objectContaining({
          playerName: 'Guest Player',
          role: 'guesser',
          lobbyCode: 'ABC123',
          durationSeconds: 0,
          playerId: validUUID,
        }),
      );
    });
  });

  it('should show loading state when connecting with valid session data', async () => {
    const sessionData = {
      playerId: 'player-id',
      playerName: 'Player',
      role: 'guesser' as const,
      durationSeconds: 0,
      lobbyCode: 'ABC123',
    };

    (LobbyPlayerSession.load as ReturnType<typeof vi.fn>).mockReturnValue(sessionData);

    const mockExecute = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)), // Simular demora
    );
    (useJoinLobby as ReturnType<typeof vi.fn>).mockReturnValue({
      execute: mockExecute,
    });

    render(
      <MemoryRouter initialEntries={['/lobby/ABC123']}>
        <WaitingRoomPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Conectando a la sala/i)).toBeVisible();
    });
  });

  it('should show error message when connection fails', async () => {
    const sessionData = {
      playerId: 'player-id',
      playerName: 'Player',
      role: 'guesser' as const,
      durationSeconds: 0,
      lobbyCode: 'ABC123',
    };

    (LobbyPlayerSession.load as ReturnType<typeof vi.fn>).mockReturnValue(sessionData);

    const mockError = new Error('Sala no encontrada');
    const mockExecute = vi.fn().mockRejectedValue(mockError);
    (useJoinLobby as ReturnType<typeof vi.fn>).mockReturnValue({
      execute: mockExecute,
    });

    render(
      <MemoryRouter initialEntries={['/lobby/ABC123']}>
        <WaitingRoomPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Sala no encontrada/i)).toBeVisible();
    });
  });
});
