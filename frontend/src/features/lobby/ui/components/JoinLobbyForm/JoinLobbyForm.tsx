import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import styles from './JoinLobbyForm.module.css';

const joinLobbySchema = z.object({
  playerName: z
    .string()
    .min(1, 'El nombre de jugador es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
});

type JoinLobbyFormData = z.infer<typeof joinLobbySchema>;

interface JoinLobbyFormProps {
  onJoin: (playerName: string) => Promise<void>;
  onError: (error: string) => void;
  code: string;
}

export function JoinLobbyForm({ onJoin, onError, code }: JoinLobbyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinLobbyFormData>({
    resolver: zodResolver(joinLobbySchema),
  });

  const onSubmit = async (data: JoinLobbyFormData) => {
    setIsLoading(true);
    try {
      await onJoin(data.playerName);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al unirse a la sala';
      onError(message);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
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

      <button type="submit" className={styles.submitButton} disabled={isLoading}>
        {isLoading ? 'Uniéndose...' : '✓ Unirse a la sala'}
      </button>

      <p className={styles.hint}>
        Código de sala: <strong>{code}</strong>
      </p>
    </form>
  );
}
