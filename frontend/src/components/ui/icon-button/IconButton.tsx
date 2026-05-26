import React from 'react';
import styles from './IconButton.module.css';

export interface IconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'danger';
  className?: string;
  'aria-label': string;
}

export function IconButton({
  children,
  onClick,
  variant = 'default',
  className,
  'aria-label': ariaLabel,
}: IconButtonProps) {
  const variantClass = variant === 'danger' ? styles.danger : styles.default;
  const buttonClass = className
    ? `${styles.root} ${variantClass} ${className}`
    : `${styles.root} ${variantClass}`;

  return (
    <button type="button" onClick={onClick} className={buttonClass} aria-label={ariaLabel}>
      {children}
    </button>
  );
}


