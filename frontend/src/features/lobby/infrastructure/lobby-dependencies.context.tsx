import React, { createContext } from 'react';
import { CreateLobby } from '../application/use-cases/create-lobby.use-case';
import { JoinLobby } from '../application/use-cases/join-lobby.use-case';
import { RejoinRound } from '../application/use-cases/rejoin-round.use-case';
import { LobbySocket } from '../application/ports/lobby-socket.port';
import { lobbyContainer } from './lobby-dependencies.container';

interface LobbyDependencies {
  lobbySocket: LobbySocket;
  createLobby: CreateLobby;
  joinLobby: JoinLobby;
  rejoinRound: RejoinRound;
}

const LobbyDependenciesContext = createContext<LobbyDependencies | undefined>(undefined);

interface LobbyDependenciesProviderProps {
  children: React.ReactNode;
}

/**
 * LobbyDependenciesProvider: expone el contenedor singleton de dependencias de `lobby`
 * mediante React Context. Debe envolver cualquier componente que use los hooks
 * `useLobbySocket`, `useCreateLobby` o `useJoinLobby`.
 */
export function LobbyDependenciesProvider({ children }: LobbyDependenciesProviderProps) {
  return (
    <LobbyDependenciesContext.Provider value={lobbyContainer}>
      {children}
    </LobbyDependenciesContext.Provider>
  );
}

/**
 * Hook que accede al contexto completo de dependencias.
 * Lanza error si se usa fuera del LobbyDependenciesProvider.
 */
export function useLobbyDependencies(): LobbyDependencies {
  const context = React.useContext(LobbyDependenciesContext);
  if (context === undefined) {
    throw new Error('useLobbyDependencies must be used within LobbyDependenciesProvider');
  }
  return context;
}

/**
 * Hook que expone solo `LobbySocket`.
 */
export function useLobbySocket(): LobbySocket {
  return useLobbyDependencies().lobbySocket;
}

/**
 * Hook que expone solo `CreateLobby`.
 */
export function useCreateLobby(): CreateLobby {
  return useLobbyDependencies().createLobby;
}

/**
 * Hook que expone solo `JoinLobby`.
 */
export function useJoinLobby(): JoinLobby {
  return useLobbyDependencies().joinLobby;
}

/**
 * Hook que expone solo `RejoinRound`.
 */
export function useRejoinRound(): RejoinRound {
  return useLobbyDependencies().rejoinRound;
}
