import styles from './GameCard.module.css';
import { Card } from '../../../domain/entities/card.entity';

interface GameCardProps {
  card: Card | null;
  loading: boolean;
}

export function GameCard({ card, loading }: GameCardProps) {
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
      <h2 className={styles.word}>{card.word.value.toUpperCase()}</h2>
      <div className={styles.divider} />
      <ul className={styles.bannedWordsList} aria-label="Palabras prohibidas">
        {card.bannedWords.values.map((bannedWord) => (
          <li key={bannedWord} className={styles.bannedWord}>
            {bannedWord}
          </li>
        ))}
      </ul>
    </div>
  );
}
