import styles from './StatusBadge.module.css';

export interface StatusBadgeProps {
  status: 'connected' | 'disconnected';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusClass = status === 'connected' ? styles.connected : styles.disconnected;
  const text = status === 'connected' ? '✓ Conectado' : '✗ Desconectado';

  return <div className={`${styles.root} ${statusClass}`}>{text}</div>;
}


