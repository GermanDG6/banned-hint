import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
import { CTAButton } from '@/components/ui/cta-button/CTAButton';
import { Timer } from '@/features/round/domain/value-objects/timer.value-object';
import { InvalidTimerException } from '@/features/round/domain/exceptions/invalid-timer.exception';
import { RoundConfigSession } from '@/shared/session/round-config.session';

export function HomePage() {
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(30);
  const navigate = useNavigate();

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, parseInt(e.target.value, 10) || 0);
    setMinutes(value);
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0));
    setSeconds(value);
  };

  const isValidTimer = (): boolean => {
    try {
      Timer.create(minutes, seconds);
      return !(minutes === 0 && seconds === 0);
    } catch {
      return false;
    }
  };

  const handlePlay = () => {
    try {
      Timer.create(minutes, seconds);
      RoundConfigSession.save({ minutes, seconds });
      navigate('/round');
    } catch (error) {
      if (error instanceof InvalidTimerException) {
        console.error('Invalid timer configuration');
      }
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>BANNED HINT</h1>
          <p className={styles.subtitle}>
            ¿Puedes describir la palabra sin usar las pistas prohibidas?
          </p>
        </div>

        <div className={styles.illustrationWrapper}>
          <img
            src="/thinking.png"
            alt="Ilustración de una persona pensando"
            className={styles.illustration}
          />
        </div>

        <div className={styles.timerSection}>
          <label className={styles.timerLabel}>
            <span className={styles.timerIcon}>⏱️</span>
            Tiempo de la ronda
          </label>

          <div className={styles.timerRow}>
            <div className={styles.timerInputWrapper}>
              <input
                type="number"
                min="0"
                max="59"
                value={String(minutes).padStart(2, '0')}
                onChange={handleMinutesChange}
                className={styles.timerInput}
                aria-label="Minutos"
              />
              <span className={styles.unitLabel}>MIN</span>
            </div>

            <div className={styles.separator}>:</div>

            <div className={styles.timerInputWrapper}>
              <input
                type="number"
                min="0"
                max="59"
                value={String(seconds).padStart(2, '0')}
                onChange={handleSecondsChange}
                className={styles.timerInput}
                aria-label="Segundos"
              />
              <span className={styles.unitLabel}>SEG</span>
            </div>
          </div>
        </div>

        <CTAButton onClick={handlePlay} disabled={!isValidTimer()} icon="▶">
          ¡JUGAR!
        </CTAButton>
      </div>
    </main>
  );
}
