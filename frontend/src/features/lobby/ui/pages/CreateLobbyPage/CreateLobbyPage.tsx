import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import styles from './CreateLobbyPage.module.css';
import { Timer } from '@/features/round/domain/value-objects/timer.value-object';
import { InvalidTimerException } from '@/features/round/domain/exceptions/invalid-timer.exception';
import { useCreateLobby } from '@/features/lobby/infrastructure/lobby-dependencies.context';

const createLobbySchema = z.object({
  playerName: z
    .string()
    .min(1, 'El nombre de jugador es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  minutes: z
    .number()
    .int('Los minutos deben ser un número entero')
    .min(0, 'Los minutos no pueden ser negativos')
    .max(59, 'Los minutos no pueden exceder 59'),
  seconds: z
    .number()
    .int('Los segundos deben ser un número entero')
    .min(0, 'Los segundos no pueden ser negativos')
    .max(59, 'Los segundos no pueden exceder 59'),
});

type CreateLobbyFormData = z.infer<typeof createLobbySchema>;

export function CreateLobbyPage() {
  const navigate = useNavigate();
  const createLobby = useCreateLobby();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateLobbyFormData>({
    resolver: zodResolver(createLobbySchema),
    defaultValues: {
      playerName: '',
      minutes: 0,
      seconds: 30,
    },
  });

  const minutes = watch('minutes');
  const seconds = watch('seconds');

  const isValidTimer = (): boolean => {
    try {
      Timer.create(minutes, seconds);
      return !(minutes === 0 && seconds === 0);
    } catch {
      return false;
    }
  };

  const onSubmit = async (data: CreateLobbyFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      const durationSeconds = Timer.create(data.minutes, data.seconds).toSeconds();
      const result = await createLobby.execute(data.playerName);

      navigate(`/lobby/${result.code}`, {
        state: {
          playerId: result.playerId,
          role: result.role,
          playerName: data.playerName,
          durationSeconds,
        },
      });
    } catch (err) {
      if (err instanceof InvalidTimerException) {
        setError('Configuración de tiempo inválida');
      } else {
        const message = err instanceof Error ? err.message : 'Error al crear la sala';
        setError(message);
      }
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Crear Sala</h1>
          <p className={styles.subtitle}>Inicia una nueva partida multijugador</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {error && <div className={styles.errorAlert}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="playerName" className={styles.label}>
              Tu nombre
            </label>
            <input
              id="playerName"
              type="text"
              placeholder="Ej: Juan"
              className={`${styles.input} ${errors.playerName ? styles.inputError : ''}`}
              {...register('playerName')}
              disabled={isLoading}
            />
            {errors.playerName && <p className={styles.error}>{errors.playerName.message}</p>}
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
                  className={styles.timerInput}
                  aria-label="Minutos"
                  {...register('minutes', { valueAsNumber: true })}
                  disabled={isLoading}
                />
                <span className={styles.unitLabel}>MIN</span>
              </div>

              <div className={styles.separator}>:</div>

              <div className={styles.timerInputWrapper}>
                <input
                  type="number"
                  min="0"
                  max="59"
                  className={styles.timerInput}
                  aria-label="Segundos"
                  {...register('seconds', { valueAsNumber: true })}
                  disabled={isLoading}
                />
                <span className={styles.unitLabel}>SEG</span>
              </div>
            </div>
            {(errors.minutes || errors.seconds) && (
              <p className={styles.error}>Configuración de tiempo inválida</p>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={!isValidTimer() || isLoading}
            title={!isValidTimer() ? 'Debes establecer un tiempo válido' : ''}
          >
            {isLoading ? 'Creando sala...' : '➕ Crear sala'}
          </button>
        </form>
      </div>
    </main>
  );
}
