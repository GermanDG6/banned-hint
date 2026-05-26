import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
import { CTAButton } from '@/components/ui/cta-button/CTAButton';

export function HomePage() {
  const navigate = useNavigate();

  const handleLocalMode = () => {
    navigate('/local/setup');
  };

  const handleLobbyMode = () => {
    navigate('/lobby/new');
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>BANNED HINT</h1>
          <p className={styles.subtitle}>
            ¿Puedes describir la palabra sin usar las pistas prohibidas?
          </p>
        </div>

        <div className={styles.illustrationWrapper}>
          <img
            src="/thinking.png"
            alt="Ilustración de una persona pensando"
            className={styles.illustration}
          />
        </div>

        <div className={styles.actionsSection}>
          <CTAButton onClick={handleLocalMode} icon="▶" variant="primary">
            MODO LOCAL
          </CTAButton>
          <CTAButton onClick={handleLobbyMode} icon="👥" variant="secondary">
            MODO SALA
          </CTAButton>
        </div>
      </div>
    </main>
  );
}
