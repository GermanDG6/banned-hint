import { Skeleton } from '../skeleton/Skeleton';
import styles from './CardComponent.module.css';

export interface CardComponentProps {
  word: string;
  bannedWords: string[];
  loading?: boolean;
}

export function CardComponent({ word, bannedWords, loading = false }: CardComponentProps) {
  if (loading) {
    return (
      <div className={styles.card} aria-busy="true" aria-label="Cargando carta">
        <div className={styles.skeletonContainer}>
          <Skeleton className={styles.skeletonWord} />
          <div className={styles.skeletonDivider} />
          <div className={styles.skeletonList}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className={styles.skeletonBannedWord} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.word}>{word.toUpperCase()}</h2>
      <div className={styles.divider} />
      <ul className={styles.bannedWordsList} aria-label="Palabras prohibidas">
        {bannedWords.map((bannedWord) => (
          <li key={bannedWord} className={styles.bannedWord}>
            {bannedWord}
          </li>
        ))}
      </ul>
    </div>
  );
}


