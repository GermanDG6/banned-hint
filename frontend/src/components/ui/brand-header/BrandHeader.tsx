import styles from './BrandHeader.module.css';

interface BrandHeaderProps {
  variant?: 'dark' | 'light';
}

export function BrandHeader({ variant = 'dark' }: BrandHeaderProps) {
  const variantClass = variant === 'light' ? styles.light : styles.dark;

  return (
    <h1 className={`${styles.root} ${variantClass}`}>BANNED HINT</h1>
  );
}

