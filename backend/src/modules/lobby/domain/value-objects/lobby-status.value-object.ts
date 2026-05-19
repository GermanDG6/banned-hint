//TODO rename to LobbyStatusType
export type LobbyStatus = 'waiting' | 'playing';

//TODO remove suffix VO
export class LobbyStatusVO {
  readonly value: LobbyStatus;

  private constructor(value: LobbyStatus) {
    this.value = value;
  }

  static create(value: string): LobbyStatusVO {
    if (value !== 'waiting' && value !== 'playing') {
      throw new Error(`Invalid LobbyStatus: "${value}". Expected "waiting" or "playing".`);
    }
    return new LobbyStatusVO(value as LobbyStatus);
  }

  static waiting(): LobbyStatusVO {
    return new LobbyStatusVO('waiting');
  }

  static playing(): LobbyStatusVO {
    return new LobbyStatusVO('playing');
  }

  isWaiting(): boolean {
    return this.value === 'waiting';
  }

  isPlaying(): boolean {
    return this.value === 'playing';
  }

  equals(other: LobbyStatusVO): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
