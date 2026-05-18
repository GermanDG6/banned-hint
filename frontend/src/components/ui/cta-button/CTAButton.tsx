import React from 'react';
import styles from './CTAButton.module.css';

interface CTAButtonProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function CTAButton({
  children,
  icon,
  onClick,
  disabled = false,
  variant = 'primary',
}: CTAButtonProps) {
  const buttonClass = variant === 'secondary' ? styles.buttonSecondary : styles.button;

  return (
    <button onClick={onClick} disabled={disabled} className={buttonClass}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
}

