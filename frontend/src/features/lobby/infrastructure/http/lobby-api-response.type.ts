export interface LobbyApiResponse {
  code: string;
  status: 'waiting' | 'playing';
  players: Array<{
    id: string;
    name: string;
    role: 'describer' | 'guesser';
  }>;
}
