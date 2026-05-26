import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import styles from './WaitingRoomPage.module.css';
import { useJoinLobby } from '@/features/lobby/infrastructure/lobby-dependencies.context';
import { PlayerRole, PlayerRoleType } from '@/features/lobby/domain/models/player.model';
import { LobbyPlayerSession } from '@/features/lobby/infrastructure/lobby-player.session';
import { JoinLobbyForm } from '../../components';
import { ConnectedWaitingRoom } from './components/ConectedWaitingRoom/ConnectedWaitingRoom.tsx';
import { PageLayout } from '@/components/ui/page-layout/PageLayout';
import { Alert } from '@/components/ui/alert/Alert';

interface LocationState {
  playerId: string;
  role: PlayerRole;
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
  const sessionData = useMemo(() => LobbyPlayerSession.load(), []);

  useEffect(() => {
    if (!code) return;

    const sourceData = state || sessionData;
    if (!sourceData) return;
    joinLobby
      .execute(code, sourceData.playerName, sourceData.role, sourceData.playerId)
      .then(() => {
        setJoinedState({
          role: sourceData.role,
          durationSeconds: sourceData.durationSeconds,
        });
        LobbyPlayerSession.save({
          playerId: sourceData.playerId,
          playerName: sourceData.playerName,
          role: sourceData.role,
          durationSeconds: sourceData.durationSeconds,
          lobbyCode: code,
        });
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error al conectar a la sala';
        setConnectionError(message);
      });
  }, [code, state, sessionData, joinLobby]);

  const handleGuestJoin = async (playerName: string) => {
    if (!code) return;
    try {
      const joinedGuest = await joinLobby.execute(code, playerName, PlayerRoleType.Guesser);

      setJoinedState({ role: PlayerRoleType.Guesser, durationSeconds: 0 });
      LobbyPlayerSession.save({
        playerId: joinedGuest.getId(),
        playerName: joinedGuest.name,
        role: joinedGuest.role,
        durationSeconds: 0,
        lobbyCode: code,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al unirse a la sala';
      setConnectionError(message);
      throw err;
    }
  };

  if (!joinedState) {
    if (!state && !sessionData) {
      return (
        <PageLayout>
          <div className={styles.header}>
            <h1 className={styles.title}>Unirse a Sala</h1>
          </div>

          {connectionError && <Alert variant="error">{connectionError}</Alert>}

          {code && (
            <JoinLobbyForm code={code} onJoin={handleGuestJoin} onError={setConnectionError} />
          )}
        </PageLayout>
      );
    }

    return (
      <PageLayout>
        <div className={styles.loadingContainer}>
          {connectionError ? (
            <Alert variant="error">{connectionError}</Alert>
          ) : (
            <p className={styles.loadingText}>Conectando a la sala...</p>
          )}
        </div>
      </PageLayout>
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
