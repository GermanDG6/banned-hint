import React from 'react';
import styles from './Alert.module.css';

interface AlertProps {
  children: React.ReactNode;
  variant: 'error' | 'success';
  className?: string;
}

export function Alert({ children, variant, className }: AlertProps) {
  const variantClass = variant === 'error' ? styles.error : styles.success;
  const alertClass = className ? `${styles.root} ${variantClass} ${className}` : `${styles.root} ${variantClass}`;

  return (
    <div role="alert" className={alertClass}>
      {children}
    </div>
  );
}

