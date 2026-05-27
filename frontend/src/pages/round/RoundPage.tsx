import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RoundPage.module.css';
import { RoundConfigSession } from '@/shared/session/round-config.session';
import { Timer } from '@/features/round/domain/value-objects/timer.value-object';
import { useCountdown } from '@/features/round/ui/hooks/use-countdown.hook';
import { useRandomCard } from '@/features/card/ui/hooks/use-get-random-card.hook';
import { TimerDisplay } from '@/components/ui/timer-display/TimerDisplay';
import { CardComponent } from '@/components/ui/card-component/CardComponent';
import { CTAButton } from '@/components/ui/cta-button/CTAButton';
import { GameLayout } from '@/components/ui/game-layout/GameLayout';
import { IconButton } from '@/components/ui/icon-button/IconButton';

export function RoundPage() {
  const navigate = useNavigate();
  const config = RoundConfigSession.load();

  useEffect(() => {
    if (!config) {
      navigate('/local/setup', { replace: true });
    }
  }, [config, navigate]);

  const initialSeconds = config ? Timer.create(config.minutes, config.seconds).toSeconds() : 0;

  const { card, loading, reload } = useRandomCard();
  const { formatted, remainingSeconds, isRunning, pause, resume, reset } = useCountdown({
    initialSeconds,
  });

  const isExpired = remainingSeconds === 0;

  const handlePauseResume = () => {
    if (isRunning) {
      pause();
    } else {
      resume();
    }
  };

  const handleExit = () => {
    RoundConfigSession.clear();
    navigate('/local/setup', { replace: true });
  };

  const handleStartNewRound = () => {
    reload();
    reset();
  };

  if (!config) return null;

  return (
    <GameLayout
      exitButton={
        <IconButton variant="danger" aria-label="Finalizar partida" onClick={handleExit}>
          ✕
        </IconButton>
      }
    >
      {isExpired ? (
        <div className={styles.centerContent}>
          <p className={styles.roundEndedMessage}>¡Ronda terminada!</p>
          <CTAButton onClick={handleStartNewRound} icon="▶">
            Iniciar nueva ronda
          </CTAButton>
        </div>
      ) : (
        <>
          <section className={styles.timerSection}>
            <TimerDisplay formatted={formatted} />
          </section>

          <section className={styles.cardSection}>
            <CardComponent
              word={card?.word.value ?? ''}
              bannedWords={card?.bannedWords.toArray() ?? []}
              loading={loading}
            />
          </section>

          <section className={styles.actions}>
            <CTAButton
              onClick={() => {
                reload();
              }}
              icon="⊙"
            >
              SIGUIENTE
            </CTAButton>
            <CTAButton
              onClick={handlePauseResume}
              variant="secondary"
              icon={isRunning ? '⏸' : '▶'}
            >
              {isRunning ? 'PAUSA' : 'CONTINUAR'}
            </CTAButton>
          </section>
        </>
      )}
    </GameLayout>
  );
}
