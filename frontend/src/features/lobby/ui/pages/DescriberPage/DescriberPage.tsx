import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './DescriberPage.module.css';
import { useLobby } from '../../hooks/use-lobby.hook';
import { useServerSyncedCountdown } from '@/shared/hooks/use-server-synced-countdown.hook';
import { TimerDisplay } from '@/components/ui/timer-display/TimerDisplay';
import { ActiveCardView } from '../../components/ActiveCardView/ActiveCardView';
import { CTAButton } from '@/components/ui/cta-button/CTAButton';
import { RoundSession } from '@/features/lobby/domain/models/round-session.model';

interface LocationState {
  roundSession: RoundSession;
}

export function DescriberPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const roundSession = state?.roundSession;

  useEffect(() => {
    if (!roundSession) {
      navigate('/', { replace: true });
    }
  }, [roundSession, navigate]);

  const lobby = useLobby({ myRole: 'describer' });

  // Usar la sesión del lobby si está disponible, sino la inicial del state
  const activeSession = lobby.roundSession ?? roundSession;

  const { formatted } = useServerSyncedCountdown({
    startAt: activeSession?.startAt ?? Date.now(),
    durationSeconds: activeSession?.durationSeconds ?? 0,
  });

  if (!activeSession) {
    return null;
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.brand}>BANNED HINT</h1>
      </header>

      <div className={styles.centerContent}>
        <section className={styles.timerSection}>
          <TimerDisplay formatted={formatted} />
        </section>

        <section className={styles.cardSection}>
          <ActiveCardView card={activeSession.card} />
        </section>

        <section className={styles.actions}>
          <CTAButton onClick={() => lobby.nextCard()} icon="⊙">
            SIGUIENTE
          </CTAButton>
        </section>
      </div>
    </main>
  );
}
