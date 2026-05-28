import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './DescriberPage.module.css';
import { useLobby } from '@/features/lobby/ui/hooks';
import { useRejoinRound } from '@/features/lobby/infrastructure/lobby-dependencies.context';
import { useServerSyncedCountdown } from '@/shared/hooks/use-server-synced-countdown.hook';
import { TimerDisplay } from '@/components/ui/timer-display/TimerDisplay';
import { CardComponent } from '@/components/ui/card-component/CardComponent';
import { CTAButton } from '@/components/ui/cta-button/CTAButton';
import { GameLayout } from '@/components/ui/game-layout/GameLayout';
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

  const handleExit = () => {
    const playerData = LobbyPlayerSession.load();
    navigate(playerData ? `/lobby/${playerData.lobbyCode}` : '/');
  };

  if (!activeSession) {
    return null;
  }

  if (lobby.roundEnded) {
    const durationSeconds =
      storedPlayerDataRef.current?.durationSeconds ?? activeSession.durationSeconds;

    const endMessage = lobby.wordGuessed
      ? `¡${lobby.wordGuessed.playerName} adivinó "${lobby.wordGuessed.word}"!`
      : '¡Ronda terminada!';

    return (
      <GameLayout onExit={handleExit}>
        <div className={styles.centerContent}>
          <p className={styles.roundEndedMessage}>{endMessage}</p>
          <CTAButton onClick={() => lobby.startRound(durationSeconds)} icon="▶">
            Iniciar nueva ronda
          </CTAButton>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout onExit={handleExit}>
      <section className={styles.timerSection}>
        <TimerDisplay formatted={formatted} />
      </section>

      <section className={styles.cardSection}>
        <CardComponent
          word={activeSession.card?.word ?? ''}
          bannedWords={activeSession.card?.bannedWords ?? []}
        />
      </section>

      <section className={styles.actions}>
        <CTAButton onClick={() => lobby.nextCard()} icon="⊙">
          SIGUIENTE
        </CTAButton>
      </section>
    </GameLayout>
  );
}
