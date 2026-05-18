import React from 'react';
import styles from './CTAButton.module.css';

interface CTAButtonProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function CTAButton({ children, icon, onClick, disabled = false }: CTAButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled} className={styles.button}>
      {children}
      {icon && <span className={styles.icon}>{icon}</span>}
    </button>
  );
}

