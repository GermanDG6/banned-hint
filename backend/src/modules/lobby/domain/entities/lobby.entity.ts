import { LobbyId } from '../value-objects/lobby-id.value-object';
import { LobbyCode } from '../value-objects/lobby-code.value-object';
import { LobbyStatusVO, LobbyStatus } from '../value-objects/lobby-status.value-object';
import { Player } from './player.entity';
import { RoundSession } from '../models/round-session.model';
import { DescriberAlreadyExistsException } from '../exceptions/describer-already-exists.exception';
import { OnlyDescriberCanException } from '../exceptions/only-describer-can.exception';

export class Lobby {
  readonly id: LobbyId;
  readonly code: LobbyCode;
  private players: Player[];
  private status: LobbyStatusVO;
  private roundSession: RoundSession | null;

  private constructor(
    id: LobbyId,
    code: LobbyCode,
    players: Player[],
    status: LobbyStatusVO,
    roundSession: RoundSession | null,
  ) {
    this.id = id;
    this.code = code;
    this.players = players;
    this.status = status;
    this.roundSession = roundSession;
  }

  static create(code: LobbyCode, hostPlayer: Player): Lobby {
    return new Lobby(LobbyId.generate(), code, [hostPlayer], LobbyStatusVO.waiting(), null);
  }

  static restore(
    id: LobbyId,
    code: LobbyCode,
    players: Player[],
    status: LobbyStatus,
    roundSession: RoundSession | null,
  ): Lobby {
    return new Lobby(id, code, players, LobbyStatusVO.create(status), roundSession);
  }

  getPlayers(): readonly Player[] {
    return Object.freeze([...this.players]);
  }

  getStatus(): LobbyStatus {
    return this.status.value;
  }

  getRoundSession(): RoundSession | null {
    return this.roundSession;
  }

  join(player: Player): void {
    // Validate: cannot have two describers
    if (player.isDescriber()) {
      const descrberExists = this.players.some((p) => p.isDescriber());
      if (descrberExists) {
        throw new DescriberAlreadyExistsException();
      }
    }

    this.players.push(player);
  }

  startRound(cardId: string, word: string, durationSeconds: number): RoundSession {
    this.status = LobbyStatusVO.playing();
    this.roundSession = {
      cardId,
      word,
      startAt: Date.now(),
      durationSeconds,
    };
    return this.roundSession;
  }

  nextCard(cardId: string, word: string): RoundSession {
    if (!this.roundSession) {
      throw new Error('No round session active');
    }

    this.roundSession = {
      cardId,
      word,
      startAt: Date.now(),
      durationSeconds: this.roundSession.durationSeconds,
    };
    return this.roundSession;
  }

  isDescriber(playerId: string): boolean {
    const player = this.players.find((p) => p.id === playerId);
    return player ? player.isDescriber() : false;
  }

  findDescriber(): Player | undefined {
    return this.players.find((p) => p.isDescriber());
  }

  validateDescriberOnly(playerId: string): void {
    if (!this.isDescriber(playerId)) {
      throw new OnlyDescriberCanException();
    }
  }
}
