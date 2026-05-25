import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './GuesserPage.module.css';
import { useLobby } from '@/features/lobby/ui/hooks';
import { useRejoinRound } from '@/features/lobby/infrastructure/lobby-dependencies.context';
import { useServerSyncedCountdown } from '@/shared/hooks/use-server-synced-countdown.hook';
import { TimerDisplay } from '@/components/ui/timer-display/TimerDisplay';
import { GuessForm } from './GuessForm';
import { RoundSession } from '@/features/lobby/domain/models/round-session.model';
import { LobbyPlayerSession } from '@/features/lobby/infrastructure/lobby-player.session';
import { RoundSessionStorage } from '@/features/lobby/infrastructure/round-session.storage';

interface LocationState {
  roundSession: RoundSession;
}

export function GuesserPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const initialStateRef = useRef(state);
  const storedSessionRef = useRef(!state ? RoundSessionStorage.load() : null);
  const storedPlayerDataRef = useRef(!state ? LobbyPlayerSession.load() : null);

  // Sesión inicial: del state de navegación o del sessionStorage (recarga de página)
  const roundSession = state?.roundSession ?? storedSessionRef.current;

  useEffect(() => {
    if (!roundSession) {
      navigate('/', { replace: true });
    }
  }, [roundSession, navigate]);

  const rejoinRound = useRejoinRound();

  useEffect(() => {
    const playerData = storedPlayerDataRef.current;
    if (!initialStateRef.current && playerData) {
      rejoinRound.execute(
        playerData.lobbyCode,
        playerData.playerName,
        playerData.role,
        playerData.playerId,
      );
    }
  }, [rejoinRound]);

  const lobby = useLobby({ myRole: 'guesser' });

  const activeSession = lobby.roundSession ?? roundSession;

  const { formatted } = useServerSyncedCountdown({
    startAt: activeSession?.startAt ?? Date.now(),
    durationSeconds: activeSession?.durationSeconds ?? 0,
  });

  if (!activeSession) {
    return null;
  }

  if (lobby.roundEnded) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <p className={styles.waitingMessage}>Esperando nueva ronda…</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.timerSection}>
          <TimerDisplay formatted={formatted} />
        </section>

        <section className={styles.formSection}>
          <GuessForm onSubmit={(word) => lobby.submitGuess(word)} guessResult={lobby.guessResult} />
        </section>
      </div>
    </main>
  );
}
