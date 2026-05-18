import styles from './TimerDisplay.module.css';

interface TimerDisplayProps {
  formatted: string;
}

export function TimerDisplay({ formatted }: TimerDisplayProps) {
  return (
    <div className={styles.container}>
      <span className={styles.icon} aria-hidden="true">
        ⏱
      </span>
      <span className={styles.time}>{formatted}</span>
    </div>
  );
}
