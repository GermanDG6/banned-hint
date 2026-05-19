import { useState, useEffect } from 'react';
import { useLobbySocket } from '../../infrastructure/lobby-dependencies.context';
import { Player, PlayerRole } from '@/features/lobby/domain/models/player.model.ts';
import { RoundSession } from '@/features/lobby/domain/models/round-session.model.ts';

interface UseLobbyOptions {
  /**
   * Rol del jugador en el lobby actual.
   * Se conoce desde el flujo:
   * - Host (createLobby) = 'describer'
   * - Invitado (joinLobby) = 'guesser'
   *
   * TODO: En el futuro, cuando los roles roten por ronda,
   * se derivará del array de players buscando el id del socket local.
   */
  myRole: PlayerRole | null;
}

interface UseLobbyResult {
  players: Player[];
  roundSession: RoundSession | null;
  myRole: PlayerRole | null;
  isConnected: boolean;
  startRound: (durationSeconds: number) => void;
  nextCard: () => void;
  submitGuess: (word: string) => void;
}

/**
 * Hook adaptador que suscribe al LobbySocket del contexto y expone el estado de UI.
 * Gestiona los handlers de conexión y eventos, y delega las acciones al socket.
 *
 * Uso:
 * ```
 * const lobby = useLobby({ myRole: 'describer' });
 * ```
 */
export function useLobby({ myRole }: UseLobbyOptions): UseLobbyResult {
  const socket = useLobbySocket();

  const [players, setPlayers] = useState<Player[]>([]);
  const [roundSession, setRoundSession] = useState<RoundSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Registrar handlers y guardar sus funciones de cleanup
    const cleanupConnect = socket.onConnect(() => {
      setIsConnected(true);
    });

    const cleanupLobbyUpdated = socket.onLobbyUpdated((updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    const cleanupRoundStarted = socket.onRoundStarted((session) => {
      setRoundSession(session);
    });

    const cleanupCardChanged = socket.onCardChanged((session) => {
      setRoundSession(session);
    });

    // Cleanup: desuscribir todos los handlers al desmontar
    return () => {
      cleanupConnect();
      cleanupLobbyUpdated();
      cleanupRoundStarted();
      cleanupCardChanged();
    };
  }, [socket]);

  const startRound = (durationSeconds: number) => {
    socket.startRound(durationSeconds);
  };

  const nextCard = () => {
    socket.nextCard();
  };

  const submitGuess = (word: string) => {
    socket.submitGuess(word);
  };

  return {
    players,
    roundSession,
    myRole,
    isConnected,
    startRound,
    nextCard,
    submitGuess,
  };
}
