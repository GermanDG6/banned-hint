import React from 'react';
import styles from './PageLayout.module.css';
import { BrandHeader } from '@/components/ui/brand-header/BrandHeader.tsx';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
  const containerClass = className ? `${styles.container} ${className}` : styles.container;

  return (
    <main className={styles.page}>
      <BrandHeader />
      <div className={containerClass}>{children}</div>
    </main>
  );
}

