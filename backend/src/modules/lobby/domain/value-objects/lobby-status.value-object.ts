export const LobbyStatusType = {
  Waiting: 'waiting',
  Playing: 'playing',
} as const;

export type LobbyStatusType = (typeof LobbyStatusType)[keyof typeof LobbyStatusType];

export class LobbyStatus {
  readonly value: LobbyStatusType;

  private constructor(value: LobbyStatusType) {
    this.value = value;
  }

  static create(value: string): LobbyStatus {
    if (value !== LobbyStatusType.Waiting && value !== LobbyStatusType.Playing) {
      throw new Error(
        `Invalid LobbyStatus: "${value}". Expected "${LobbyStatusType.Waiting}" or "${LobbyStatusType.Playing}".`,
      );
    }
    return new LobbyStatus(value as LobbyStatusType);
  }

  static waiting(): LobbyStatus {
    return new LobbyStatus(LobbyStatusType.Waiting);
  }

  static playing(): LobbyStatus {
    return new LobbyStatus(LobbyStatusType.Playing);
  }

  isWaiting(): boolean {
    return this.value === LobbyStatusType.Waiting;
  }

  isPlaying(): boolean {
    return this.value === LobbyStatusType.Playing;
  }

  equals(other: LobbyStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
