import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import styles from './TimerPicker.module.css';

export interface TimerPickerControlledProps {
  minutes: number;
  seconds: number;
  onMinutesChange: (value: number) => void;
  onSecondsChange: (value: number) => void;
  disabled?: boolean;
  registerMinutes?: never;
  registerSeconds?: never;
}

export interface TimerPickerHookFormProps {
  registerMinutes: UseFormRegisterReturn;
  registerSeconds: UseFormRegisterReturn;
  disabled?: boolean;
  minutes?: never;
  seconds?: never;
  onMinutesChange?: never;
  onSecondsChange?: never;
}

export type TimerPickerProps = TimerPickerControlledProps | TimerPickerHookFormProps;

export function TimerPicker(props: TimerPickerProps) {
  const isHookForm = 'registerMinutes' in props;

  if (isHookForm) {
    const { registerMinutes, registerSeconds, disabled = false } = props;

    return (
      <div className={styles.root}>
        <label className={styles.label}>
          <span className={styles.icon}>⏱️</span>
          Tiempo de la ronda
        </label>

        <div className={styles.row}>
          <div className={styles.inputWrapper}>
            <input
              type="number"
              min="0"
              max="59"
              className={styles.input}
              disabled={disabled}
              aria-label="Minutos"
              {...registerMinutes}
            />
            <span className={styles.unitLabel}>MIN</span>
          </div>

          <div className={styles.separator}>:</div>

          <div className={styles.inputWrapper}>
            <input
              type="number"
              min="0"
              max="59"
              className={styles.input}
              disabled={disabled}
              aria-label="Segundos"
              {...registerSeconds}
            />
            <span className={styles.unitLabel}>SEG</span>
          </div>
        </div>
      </div>
    );
  }

  // Modo controlado
  const { minutes, seconds, onMinutesChange, onSecondsChange, disabled = false } = props;

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, parseInt(e.target.value, 10) || 0);
    onMinutesChange(value);
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0));
    onSecondsChange(value);
  };

  return (
    <div className={styles.root}>
      <label className={styles.label}>
        <span className={styles.icon}>⏱️</span>
        Tiempo de la ronda
      </label>

      <div className={styles.row}>
        <div className={styles.inputWrapper}>
          <input
            type="number"
            min="0"
            max="59"
            value={String(minutes).padStart(2, '0')}
            onChange={handleMinutesChange}
            className={styles.input}
            disabled={disabled}
            aria-label="Minutos"
          />
          <span className={styles.unitLabel}>MIN</span>
        </div>

        <div className={styles.separator}>:</div>

        <div className={styles.inputWrapper}>
          <input
            type="number"
            min="0"
            max="59"
            value={String(seconds).padStart(2, '0')}
            onChange={handleSecondsChange}
            className={styles.input}
            disabled={disabled}
            aria-label="Segundos"
          />
          <span className={styles.unitLabel}>SEG</span>
        </div>
      </div>
    </div>
  );
}


