import React from 'react';
import { BrandHeader } from '../brand-header/BrandHeader';
import styles from './GameLayout.module.css';

export interface GameLayoutProps {
  children: React.ReactNode;
  exitButton?: React.ReactNode;
}

export function GameLayout({ children, exitButton }: GameLayoutProps) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <BrandHeader variant="light" />
        {exitButton && <div className={styles.exitSlot}>{exitButton}</div>}
      </header>

      <div className={styles.content}>{children}</div>
    </main>
  );
}


