import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import styles from './CreateLobbyPage.module.css';
import { Timer } from '@/features/round/domain/value-objects/timer.value-object';
import { InvalidTimerException } from '@/features/round/domain/exceptions/invalid-timer.exception';
import { useCreateLobby } from '@/features/lobby/infrastructure/lobby-dependencies.context';
import { CTAButton } from '@/components/ui/cta-button/CTAButton';
import { PageLayout } from '@/components/ui/page-layout/PageLayout';
import { FormField } from '@/components/ui/form-field/FormField';
import { TextInput } from '@/components/ui/text-input/TextInput';
import { TimerPicker } from '@/components/ui/timer-picker/TimerPicker';
import { Alert } from '@/components/ui/alert/Alert';

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
    <PageLayout>
      <CTAButton variant="secondary" onClick={() => navigate('/')} className={styles.backButton}>
        ← Volver
      </CTAButton>

      <div className={styles.header}>
        <h2 className={styles.title}>Crear Sala</h2>
        <p className={styles.subtitle}>Inicia una nueva partida multijugador</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {error && <Alert variant="error">{error}</Alert>}

        <FormField label="Tu nombre" htmlFor="playerName" error={errors.playerName?.message}>
          <TextInput
            id="playerName"
            type="text"
            placeholder="Ej: Juan"
            hasError={!!errors.playerName}
            {...register('playerName')}
            disabled={isLoading}
          />
        </FormField>

        <TimerPicker
          registerMinutes={register('minutes', { valueAsNumber: true })}
          registerSeconds={register('seconds', { valueAsNumber: true })}
          disabled={isLoading}
        />
        {(errors.minutes || errors.seconds) && (
          <p className={styles.error}>Configuración de tiempo inválida</p>
        )}

        <CTAButton
          onClick={handleSubmit(onSubmit)}
          disabled={!isValidTimer() || isLoading}
          icon={isLoading ? undefined : '➕'}
        >
          {isLoading ? 'Creando sala...' : 'Crear sala'}
        </CTAButton>
      </form>
    </PageLayout>
  );
}
