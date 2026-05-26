import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import styles from './JoinLobbyForm.module.css';
import { FormField } from '@/components/ui/form-field/FormField';
import { TextInput } from '@/components/ui/text-input/TextInput';
import { CTAButton } from '@/components/ui/cta-button/CTAButton';

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

      <CTAButton onClick={handleSubmit(onSubmit)} disabled={isLoading} icon="✓">
        {isLoading ? 'Uniéndose...' : 'Unirse a la sala'}
      </CTAButton>

      <p className={styles.hint}>
        Código de sala: <strong>{code}</strong>
      </p>
    </form>
  );
}
