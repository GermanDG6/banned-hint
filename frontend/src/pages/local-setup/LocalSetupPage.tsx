import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LocalSetupPage.module.css';
import { CTAButton } from '@/components/ui/cta-button/CTAButton';
import { TimerPicker } from '@/components/ui/timer-picker/TimerPicker';
import { PageLayout } from '@/components/ui/page-layout/PageLayout';
import { Timer } from '@/features/round/domain/value-objects/timer.value-object';
import { InvalidTimerException } from '@/features/round/domain/exceptions/invalid-timer.exception';
import { RoundConfigSession } from '@/shared/session/round-config.session';

export function LocalSetupPage() {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(30);
  const navigate = useNavigate();

  const handleMinutesChange = (value: number) => {
    setMinutes(value);
  };

  const handleSecondsChange = (value: number) => {
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

  const handleBack = () => {
    navigate('/');
  };

  return (
    <PageLayout>
      <div className={styles.header}>
        <h2 className={styles.title}>MODO LOCAL</h2>
        <p className={styles.subtitle}>Configura el tiempo de la ronda</p>
      </div>

      <TimerPicker
        minutes={minutes}
        seconds={seconds}
        onMinutesChange={handleMinutesChange}
        onSecondsChange={handleSecondsChange}
      />

      <div className={styles.actionsSection}>
        <CTAButton onClick={handlePlay} disabled={!isValidTimer()} icon="▶">
          ¡JUGAR!
        </CTAButton>
        <CTAButton onClick={handleBack} variant="secondary" icon="←">
          Volver
        </CTAButton>
      </div>
    </PageLayout>
  );
}
