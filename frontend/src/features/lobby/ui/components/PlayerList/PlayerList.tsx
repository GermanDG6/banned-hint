import { Player } from '@/features/lobby/domain/entities/player.entity';
import { PlayerRoleType } from '@/features/lobby/domain/models/player.model';
import styles from './PlayerList.module.css';

interface PlayerListProps {
  players: Player[];
}

export function PlayerList({ players }: PlayerListProps) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Jugadores conectados ({players.length})</h3>
      {players.length === 0 ? (
        <p className={styles.empty}>Esperando a otros jugadores...</p>
      ) : (
        <ul className={styles.list}>
          {players.map((player) => (
            <li key={player.id.value} className={styles.item}>
              <span className={styles.name}>{player.name}</span>
              <span
                className={`${styles.badge} ${
                  player.role === PlayerRoleType.Describer
                    ? styles.badgeDescriber
                    : styles.badgeGuesser
                }`}
              >
                {player.role === PlayerRoleType.Describer ? 'Describe' : 'Adivina'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
