import React from 'react';
import styles from './TextInput.module.css';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'on-dark';
  hasError?: boolean;
}

export function TextInput({
  variant = 'default',
  hasError = false,
  className,
  ...rest
}: TextInputProps) {
  const variantClass = variant === 'on-dark' ? styles.onDark : styles.default;
  const errorClass = hasError ? styles.error : '';
  const inputClass = className
    ? `${styles.input} ${variantClass} ${errorClass} ${className}`
    : `${styles.input} ${variantClass} ${errorClass}`;

  return <input className={inputClass} {...rest} />;
}

