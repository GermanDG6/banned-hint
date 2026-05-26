import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import styles from './ConnectedWaitingRoom.module.css';
import { useLobby } from '@/features/lobby/ui/hooks/use-lobby.hook.ts';
import { PlayerRoleType, PlayerRole } from '@/features/lobby/domain/models/player.model.ts';
import { LobbyCodeDisplay, PlayerList } from '../../../../components';
import { RoundSessionStorage } from '@/features/lobby/infrastructure/round-session.storage.ts';
import { PageLayout } from '@/components/ui/page-layout/PageLayout';
import { CTAButton } from '@/components/ui/cta-button/CTAButton';
import { StatusBadge } from '@/components/ui/status-badge/StatusBadge';

interface ConnectedWaitingRoomProps {
  code: string;
  myRole: PlayerRole;
  durationSeconds: number;
}

export function ConnectedWaitingRoom({ code, myRole, durationSeconds }: ConnectedWaitingRoomProps) {
  const navigate = useNavigate();
  const lobby = useLobby({ myRole });

  // Efecto: navegar cuando comienza una ronda
  useEffect(() => {
    if (!lobby.roundSession) return;

    RoundSessionStorage.save(lobby.roundSession);

    if (myRole === PlayerRoleType.Describer) {
      navigate('/round/describe', { state: { roundSession: lobby.roundSession } });
    } else {
      navigate('/round/guess', { state: { roundSession: lobby.roundSession } });
    }
  }, [lobby.roundSession, myRole, navigate]);

  const handleStartRound = () => {
    if (durationSeconds > 0) {
      lobby.startRound(durationSeconds);
    }
  };

  return (
    <PageLayout>
      <div className={styles.header}>
        <h1 className={styles.title}>Sala de Espera</h1>
      </div>

      <div className={styles.content}>
        <LobbyCodeDisplay code={code} />

        <PlayerList players={lobby.players} />

        {myRole === PlayerRoleType.Describer && (
          <CTAButton onClick={handleStartRound} disabled={!lobby.isConnected} icon="🎬">
            Iniciar ronda
          </CTAButton>
        )}

        <div className={styles.statusBar}>
          <StatusBadge status={lobby.isConnected ? 'connected' : 'disconnected'} />
        </div>
      </div>
    </PageLayout>
  );
}
