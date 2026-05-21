import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import styles from './ConnectedWaitingRoom.module.css';
import { useLobby } from '@/features/lobby/ui/hooks/use-lobby.hook';
import { PlayerRoleType, PlayerRole } from '@/features/lobby/domain/models/player.model';
import { LobbyCodeDisplay, PlayerList } from '../../components';
import { RoundSessionStorage } from '@/features/lobby/infrastructure/round-session.storage';

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
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Sala de Espera</h1>
        </div>

        <div className={styles.content}>
          <LobbyCodeDisplay code={code} />

          <PlayerList players={lobby.players} />

          {myRole === PlayerRoleType.Describer && (
            <button
              onClick={handleStartRound}
              className={styles.startButton}
              disabled={!lobby.isConnected}
            >
              🎬 Iniciar ronda
            </button>
          )}

          <div className={styles.statusBar}>
            <div
              className={`${styles.statusIndicator} ${
                lobby.isConnected ? styles.statusConnected : styles.statusDisconnected
              }`}
            >
              {lobby.isConnected ? '✓ Conectado' : '✗ Desconectado'}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
