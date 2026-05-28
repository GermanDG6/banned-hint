import { useState, useEffect } from 'react';
import { useLobbySocket } from '../../infrastructure/lobby-dependencies.context';
import { RoundSessionStorage } from '../../infrastructure/round-session.storage';
import { Player } from '@/features/lobby/domain/entities/player.entity';
import { PlayerRole } from '@/features/lobby/domain/models/player.model.ts';
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
  guessResult: { correct: boolean } | null;
  wordGuessed: { playerName: string; word: string } | null;
  roundEnded: boolean;
  startRound: (durationSeconds: number) => void;
  nextCard: () => void;
  submitGuess: (word: string) => void;
  endRound: () => void;
}

export function useLobby({ myRole }: UseLobbyOptions): UseLobbyResult {
  const socket = useLobbySocket();

  const [players, setPlayers] = useState<Player[]>([]);
  const [roundSession, setRoundSession] = useState<RoundSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [guessResult, setGuessResult] = useState<{ correct: boolean } | null>(null);
  const [wordGuessed, setWordGuessed] = useState<{ playerName: string; word: string } | null>(null);
  const [roundEnded, setRoundEnded] = useState(false);

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
      setGuessResult(null);
      setWordGuessed(null);
      setRoundEnded(false);
    });

    const cleanupCardChanged = socket.onCardChanged((session) => {
      setRoundSession(session);
      setGuessResult(null); // Limpiar resultado anterior al cambiar carta
    });

    const cleanupGuessResult = socket.onGuessResult((result) => {
      setGuessResult(result);
    });

    const cleanupWordGuessed = socket.onWordGuessed((data) => {
      setWordGuessed(data);
      setRoundEnded(true);
    });

    const cleanupRoundEnded = socket.onRoundEnded(() => {
      RoundSessionStorage.clear();
      setRoundEnded(true);
    });

    // Cleanup: desuscribir todos los handlers al desmontar
    return () => {
      cleanupConnect();
      cleanupLobbyUpdated();
      cleanupRoundStarted();
      cleanupCardChanged();
      cleanupGuessResult();
      cleanupWordGuessed();
      cleanupRoundEnded();
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

  const endRound = () => {
    socket.endRound();
  };

  return {
    players,
    roundSession,
    myRole,
    isConnected,
    guessResult,
    wordGuessed,
    roundEnded,
    startRound,
    nextCard,
    submitGuess,
    endRound,
  };
}
