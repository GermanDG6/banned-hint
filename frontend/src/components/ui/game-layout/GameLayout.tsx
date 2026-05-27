import React from 'react';
import { BrandHeader } from '../brand-header/BrandHeader';
import { IconButton } from '../icon-button/IconButton';
import styles from './GameLayout.module.css';

export interface GameLayoutProps {
  children: React.ReactNode;
  onExit: () => void;
}

export function GameLayout({ children, onExit }: GameLayoutProps) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <BrandHeader variant="light" />
      </header>

      <div className={styles.exitButton}>
        <IconButton variant="danger" aria-label="Finalizar partida" onClick={onExit}>
          ✕
        </IconButton>
      </div>

      <div className={styles.content}>{children}</div>
    </main>
  );
}
