import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RoundPage.module.css';
import { RoundConfigSession } from '@/shared/session/round-config.session';
import { Timer } from '@/features/round/domain/value-objects/timer.value-object';
import { useCountdown } from '@/features/round/ui/hooks/use-countdown.hook';
import { useRandomCard } from '@/features/card/ui/hooks/use-get-random-card.hook';
import { TimerDisplay } from '@/features/round/ui/components/TimerDisplay/TimerDisplay';
import { GameCard } from '@/features/card/ui/components/GameCard/GameCard';
import { CTAButton } from '@/components/ui/cta-button/CTAButton';

export function RoundPage() {
  const navigate = useNavigate();
  const config = RoundConfigSession.load();

  useEffect(() => {
    if (!config) {
      navigate('/', { replace: true });
    }
  }, [config, navigate]);

  const initialSeconds = config ? Timer.create(config.minutes, config.seconds).toSeconds() : 0;

  const { card, loading, reload } = useRandomCard();
  const { formatted, isRunning, pause, resume, reset } = useCountdown({
    initialSeconds,
    onExpire: () => {
      reload();
      reset();
    },
  });

  const handleNext = () => {
    reload();
    reset();
  };

  const handlePauseResume = () => {
    if (isRunning) {
      pause();
    } else {
      resume();
    }
  };

  const handleExit = () => {
    RoundConfigSession.clear();
    navigate('/', { replace: true });
  };

  if (!config) return null;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.brand}>BANNED HINT</h1>
        <button className={styles.exitButton} onClick={handleExit} aria-label="Finalizar partida">
          ✕
        </button>
      </header>

      <div className={styles.centerContent}>
        <section className={styles.timerSection}>
          <TimerDisplay formatted={formatted} />
        </section>

        <section className={styles.cardSection}>
          <GameCard card={card} loading={loading} />
        </section>
        <section className={styles.actions}>
          <CTAButton onClick={handleNext} icon="⊙">
            SIGUIENTE
          </CTAButton>
          <CTAButton onClick={handlePauseResume} variant="secondary" icon={isRunning ? '⏸' : '▶'}>
            {isRunning ? 'PAUSA' : 'CONTINUAR'}
          </CTAButton>
        </section>
      </div>
    </main>
  );
}
