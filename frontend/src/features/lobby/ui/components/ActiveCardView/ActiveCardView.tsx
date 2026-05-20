import styles from './ActiveCardView.module.css';
import { CardData } from '@/features/lobby/domain/models/card-data.model';

interface ActiveCardViewProps {
  card: CardData | undefined;
  loading?: boolean;
}

export function ActiveCardView({ card, loading = false }: ActiveCardViewProps) {
  if (loading) {
    return (
      <div className={styles.card} aria-busy="true" aria-label="Cargando carta">
        <div className={styles.skeletonWord} />
        <div className={styles.divider} />
        <div className={styles.skeletonList}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeletonBannedWord} />
          ))}
        </div>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className={styles.card}>
      <h2 className={styles.word}>{card.word.toUpperCase()}</h2>
      <div className={styles.divider} />
      <ul className={styles.bannedWordsList} aria-label="Palabras prohibidas">
        {card.bannedWords.map((bannedWord) => (
          <li key={bannedWord} className={styles.bannedWord}>
            {bannedWord}
          </li>
        ))}
      </ul>
    </div>
  );
}
