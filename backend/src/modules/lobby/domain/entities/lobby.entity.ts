import { LobbyId } from '../value-objects/lobby-id.value-object';
import { LobbyCode } from '../value-objects/lobby-code.value-object';
import { LobbyStatus, LobbyStatusType } from '../value-objects/lobby-status.value-object';
import { Player } from './player.entity';
import { PlayerRoleType } from '../value-objects/player-role.value-object';
import { RoundSession } from '../models/round-session.model';
import { DescriberAlreadyExistsException } from '../exceptions/describer-already-exists.exception';
import { OnlyDescriberCanException } from '../exceptions/only-describer-can.exception';
import { NoActiveRoundException } from '../exceptions/no-active-round.exception';

export class Lobby {
  readonly id: LobbyId;
  readonly code: LobbyCode;
  private players: Player[];
  private status: LobbyStatus;
  private roundSession: RoundSession | null;

  private constructor(
    id: LobbyId,
    code: LobbyCode,
    players: Player[],
    status: LobbyStatus,
    roundSession: RoundSession | null,
  ) {
    this.id = id;
    this.code = code;
    this.players = players;
    this.status = status;
    this.roundSession = roundSession;
  }

  static create(code: LobbyCode, hostPlayer: Player): Lobby {
    return new Lobby(LobbyId.generate(), code, [hostPlayer], LobbyStatus.waiting(), null);
  }

  static restore(
    id: LobbyId,
    code: LobbyCode,
    players: Player[],
    status: LobbyStatusType,
    roundSession: RoundSession | null,
  ): Lobby {
    return new Lobby(id, code, players, LobbyStatus.create(status), roundSession);
  }

  getPlayers(): readonly Player[] {
    return Object.freeze([...this.players]);
  }

  getStatus(): LobbyStatusType {
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

  startRound(
    cardId: string,
    word: string,
    bannedWords: string[],
    durationSeconds: number,
  ): RoundSession {
    this.status = LobbyStatus.playing();
    this.roundSession = {
      cardId,
      word,
      startAt: Date.now(),
      durationSeconds,
      bannedWords,
    };
    return this.roundSession;
  }

  nextCard(cardId: string, word: string, bannedWords: string[]): RoundSession {
    if (!this.roundSession) {
      throw new Error('No round session active');
    }

    this.roundSession = {
      cardId,
      word,
      startAt: this.roundSession.startAt,
      durationSeconds: this.roundSession.durationSeconds,
      bannedWords,
    };
    return this.roundSession;
  }

  endRound(): void {
    if (!this.roundSession) {
      throw new NoActiveRoundException();
    }

    this.status = LobbyStatus.waiting();
    this.roundSession = null;
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

  assignDescriberId(socketId: string): void {
    const describer = this.findDescriber();
    if (!describer) {
      throw new OnlyDescriberCanException('No describer found to assign socket');
    }
    // Replace the describer with a new instance with the socket ID
    const describerIndex = this.players.findIndex((p) => p.isDescriber());
    if (describerIndex !== -1) {
      this.players[describerIndex] = Player.create(
        socketId,
        describer.name,
        PlayerRoleType.Describer,
      );
    }
  }

  findGuesserById(playerId: string): Player | undefined {
    return this.players.find((p) => p.isGuesser() && p.id === playerId);
  }
}
