import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import styles from './GuessForm.module.css';
import { TextInput } from '@/components/ui/text-input/TextInput';
import { Alert } from '@/components/ui/alert/Alert';

const guessSchema = z.object({
  word: z
    .string()
    .min(1, 'Debes escribir una palabra')
    .transform((val) => val.trim()),
});

type GuessFormData = z.infer<typeof guessSchema>;

interface GuessFormProps {
  onSubmit: (word: string) => void;
  guessResult: { correct: boolean } | null;
}

export function GuessForm({ onSubmit, guessResult }: GuessFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GuessFormData>({
    resolver: zodResolver(guessSchema),
  });

  const handleFormSubmit = (data: GuessFormData) => {
    onSubmit(data.word);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form}>
      <div className={styles.inputGroup}>
        <TextInput
          variant="on-dark"
          placeholder="Escribe tu intento..."
          hasError={!!errors.word}
          disabled={guessResult?.correct}
          {...register('word')}
        />
        {errors.word && <p className={styles.error}>{errors.word.message}</p>}
      </div>

      <button type="submit" disabled={guessResult?.correct} className={styles.submitButton}>
        <span>📤</span>
        Enviar
      </button>

      {guessResult && (
        <Alert variant={guessResult.correct ? 'success' : 'error'}>
          {guessResult.correct ? '✅ ¡Correcto!' : '❌ Inténtalo de nuevo'}
        </Alert>
      )}
    </form>
  );
}
