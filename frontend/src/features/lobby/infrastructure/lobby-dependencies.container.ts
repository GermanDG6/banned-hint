import { CreateLobby } from '../application/use-cases/create-lobby.use-case';
import { JoinLobby } from '../application/use-cases/join-lobby.use-case';
import { RejoinRound } from '../application/use-cases/rejoin-round.use-case';
import { HttpLobbyRepository } from './http/http-lobby.repository';
import { SocketIOLobbySocket } from './ws/socket-io-lobby-socket';
import { FetchHttpClient } from '@/shared/http/fetch-http-client.ts';
import { LobbySocket } from '../application/ports/lobby-socket.port';

const httpClient = new FetchHttpClient();
const lobbyRepository = new HttpLobbyRepository(httpClient);
const lobbySocket: LobbySocket = new SocketIOLobbySocket();
const createLobby = new CreateLobby(lobbyRepository);
const joinLobby = new JoinLobby(lobbyRepository, lobbySocket);
const rejoinRound = new RejoinRound(lobbySocket);

export const lobbyContainer = {
  lobbySocket,
  createLobby,
  joinLobby,
  rejoinRound,
} as const;
