import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import styles from './GuessForm.module.css';

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
        <input
          {...register('word')}
          type="text"
          placeholder="Escribe tu intento..."
          className={styles.input}
          disabled={guessResult?.correct}
        />
        {errors.word && <p className={styles.error}>{errors.word.message}</p>}
      </div>

      <button type="submit" className={styles.button} disabled={guessResult?.correct}>
        📤 Enviar
      </button>

      {guessResult && (
        <div
          className={`${styles.feedback} ${
            guessResult.correct ? styles.correct : styles.incorrect
          }`}
        >
          {guessResult.correct ? '✅ ¡Correcto!' : '❌ Inténtalo de nuevo'}
        </div>
      )}
    </form>
  );
}
