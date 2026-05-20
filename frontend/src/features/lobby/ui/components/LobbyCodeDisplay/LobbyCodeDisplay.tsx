import { useState } from 'react';
import styles from './LobbyCodeDisplay.module.css';

interface LobbyCodeDisplayProps {
  code: string;
}

export function LobbyCodeDisplay({ code }: LobbyCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className={styles.container}>
      <p className={styles.label}>Código de sala</p>
      <div className={styles.codeWrapper}>
        <span className={styles.code}>{code}</span>
        <button
          onClick={handleCopy}
          className={styles.copyButton}
          aria-label={`Copiar código de sala ${code}`}
          title={copied ? 'Copiado!' : 'Copiar'}
        >
          {copied ? '✓' : '📋'}
        </button>
      </div>
      <p className={styles.hint}>Comparte este código con otros jugadores</p>
    </div>
  );
}
