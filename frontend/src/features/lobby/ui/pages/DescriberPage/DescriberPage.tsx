import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './DescriberPage.module.css';
import { useLobby } from '@/features/lobby/ui/hooks';
import { useRejoinRound } from '@/features/lobby/infrastructure/lobby-dependencies.context';
import { useServerSyncedCountdown } from '@/shared/hooks/use-server-synced-countdown.hook';
import { TimerDisplay } from '@/components/ui/timer-display/TimerDisplay';
import { ActiveCardView } from '@/features/lobby/ui/components';
import { CTAButton } from '@/components/ui/cta-button/CTAButton';
import { RoundSession } from '@/features/lobby/domain/models/round-session.model';
import { LobbyPlayerSession } from '@/features/lobby/infrastructure/lobby-player.session';
import { RoundSessionStorage } from '@/features/lobby/infrastructure/round-session.storage';

interface LocationState {
  roundSession: RoundSession;
}

export function DescriberPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const initialStateRef = useRef(state);
  const storedSessionRef = useRef(!state ? RoundSessionStorage.load() : null);
  const storedPlayerDataRef = useRef(!state ? LobbyPlayerSession.load() : null);

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

  const lobby = useLobby({ myRole: 'describer' });

  const activeSession = lobby.roundSession ?? roundSession;

  const { formatted } = useServerSyncedCountdown({
    startAt: activeSession?.startAt ?? Date.now(),
    durationSeconds: activeSession?.durationSeconds ?? 0,
    onExpire: () => lobby.endRound(),
  });

  if (!activeSession) {
    return null;
  }

  if (lobby.roundEnded) {
    const durationSeconds =
      storedPlayerDataRef.current?.durationSeconds ?? activeSession.durationSeconds;

    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.brand}>BANNED HINT</h1>
        </header>
        <div className={styles.centerContent}>
          <p className={styles.roundEndedMessage}>¡Ronda terminada!</p>
          <CTAButton onClick={() => lobby.startRound(durationSeconds)} icon="▶">
            Iniciar nueva ronda
          </CTAButton>
        </div>
      </main>
    );
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
