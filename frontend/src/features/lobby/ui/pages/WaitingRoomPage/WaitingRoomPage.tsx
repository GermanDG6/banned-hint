import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './WaitingRoomPage.module.css';
import { useJoinLobby } from '@/features/lobby/infrastructure/lobby-dependencies.context';
import { PlayerRole } from '@/features/lobby/domain/models/player.model';
import { JoinLobbyForm } from '../../components';
import { ConnectedWaitingRoom } from './ConnectedWaitingRoom';

interface LocationState {
  playerId: string;
  role: 'describer' | 'guesser';
  playerName: string;
  durationSeconds: number;
}

interface JoinedState {
  role: PlayerRole;
  durationSeconds: number;
}

export function WaitingRoomPage() {
  const { code } = useParams<{ code: string }>();
  const location = useLocation();
  const joinLobby = useJoinLobby();

  const [joinedState, setJoinedState] = useState<JoinedState | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const state = location.state as LocationState | null;

  // Efecto: Host conecta automáticamente al montar
  useEffect(() => {
    if (!code || !state) return;

    joinLobby
      .execute(code, state.playerName, 'describer')
      .then(() => {
        setJoinedState({ role: 'describer', durationSeconds: state.durationSeconds });
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error al conectar a la sala';
        setConnectionError(message);
      });
  }, [code, state, joinLobby]);

  const handleGuestJoin = async (playerName: string) => {
    if (!code) return;
    try {
      await joinLobby.execute(code, playerName, 'guesser');
      setJoinedState({ role: 'guesser', durationSeconds: 0 });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al unirse a la sala';
      setConnectionError(message);
      throw err;
    }
  };

  if (!joinedState) {
    if (!state) {
      return (
        <main className={styles.page}>
          <div className={styles.container}>
            <div className={styles.header}>
              <h1 className={styles.title}>Unirse a Sala</h1>
            </div>

            {connectionError && <div className={styles.errorAlert}>{connectionError}</div>}

            {code && (
              <JoinLobbyForm code={code} onJoin={handleGuestJoin} onError={setConnectionError} />
            )}
          </div>
        </main>
      );
    }

    return (
      <main className={styles.page}>
        <div className={styles.loadingContainer}>
          {connectionError ? (
            <p className={styles.errorAlert}>{connectionError}</p>
          ) : (
            <p className={styles.loadingText}>Conectando a la sala...</p>
          )}
        </div>
      </main>
    );
  }

  return (
    <ConnectedWaitingRoom
      code={code ?? ''}
      myRole={joinedState.role}
      durationSeconds={joinedState.durationSeconds}
    />
  );
}
