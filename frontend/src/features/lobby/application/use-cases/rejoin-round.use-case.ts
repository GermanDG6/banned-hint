import { LobbySocket } from '../ports/lobby-socket.port';
import { PlayerRole } from '@/features/lobby/domain/models/player.model.ts';
import { Player } from '@/features/lobby/domain/entities/player.entity.ts';

/**
 * RejoinRound: caso de uso para reconectar a un lobby activo con una ronda en progreso.
 *
 * Diferencias con JoinLobby:
 * - No verifica la existencia del lobby vía HTTP (asume que ya existe).
 * - Siempre requiere `playerId` para identificar al jugador reconectado.
 * - Llama directamente a `connect()` y `joinLobby()` sin verificación previa.
 *
 * Uso típico:
 * - Recarga de página en `/round/describe` o `/round/guess`.
 * - Restauración de sesión desde `LobbyPlayerSession` y `RoundSessionStorage`.
 */
export class RejoinRound {
  constructor(private readonly lobbySocket: LobbySocket) {}

  execute(code: string, playerName: string, role: PlayerRole, playerId: string): void {
    const player = Player.create(playerId, playerName, role);
    this.lobbySocket.connect();
    this.lobbySocket.joinLobby(code, player);
  }
}
