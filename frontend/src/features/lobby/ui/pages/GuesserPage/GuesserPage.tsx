import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './GuesserPage.module.css';
import { useLobby } from '../../hooks/use-lobby.hook';
import { useServerSyncedCountdown } from '@/shared/hooks/use-server-synced-countdown.hook';
import { TimerDisplay } from '@/components/ui/timer-display/TimerDisplay';
import { GuessForm } from './GuessForm';
import { RoundSession } from '@/features/lobby/domain/models/round-session.model';

interface LocationState {
  roundSession: RoundSession;
}

export function GuesserPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const roundSession = state?.roundSession;

  useEffect(() => {
    if (!roundSession) {
      navigate('/', { replace: true });
    }
  }, [roundSession, navigate]);

  const lobby = useLobby({ myRole: 'guesser' });
  const { formatted } = useServerSyncedCountdown({
    startAt: roundSession?.startAt ?? Date.now(),
    durationSeconds: roundSession?.durationSeconds ?? 0,
  });

  if (!roundSession) {
    return null;
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
