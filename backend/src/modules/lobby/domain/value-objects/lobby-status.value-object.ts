export type LobbyStatusType = 'waiting' | 'playing';

export class LobbyStatus {
  readonly value: LobbyStatusType;

  private constructor(value: LobbyStatusType) {
    this.value = value;
  }

  static create(value: string): LobbyStatus {
    if (value !== 'waiting' && value !== 'playing') {
      throw new Error(`Invalid LobbyStatus: "${value}". Expected "waiting" or "playing".`);
    }
    return new LobbyStatus(value as LobbyStatusType);
  }

  static waiting(): LobbyStatus {
    return new LobbyStatus('waiting');
  }

  static playing(): LobbyStatus {
    return new LobbyStatus('playing');
  }

  isWaiting(): boolean {
    return this.value === 'waiting';
  }

  isPlaying(): boolean {
    return this.value === 'playing';
  }

  equals(other: LobbyStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
