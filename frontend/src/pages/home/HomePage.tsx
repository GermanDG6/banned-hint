import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
import { CTAButton } from '@/components/ui/cta-button/CTAButton';
import { PageLayout } from '@/components/ui/page-layout/PageLayout';

export function HomePage() {
  const navigate = useNavigate();

  const handleLocalMode = () => {
    navigate('/local/setup');
  };

  const handleLobbyMode = () => {
    navigate('/lobby/new');
  };

  return (
    <PageLayout>
      <div className={styles.header}>
        <p className={styles.subtitle}>
          ¿Puedes describir la palabra sin usar las pistas prohibidas?
        </p>
      </div>

      <div className={styles.actionsSection}>
        <CTAButton onClick={handleLocalMode} icon="▶" variant="primary">
          MODO LOCAL
        </CTAButton>
        <CTAButton onClick={handleLobbyMode} icon="👥" variant="secondary">
          MODO SALA
        </CTAButton>
      </div>
    </PageLayout>
  );
}
