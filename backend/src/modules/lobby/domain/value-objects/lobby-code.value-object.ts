export class LobbyCode {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static generate(): LobbyCode {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return new LobbyCode(code);
  }

  static from(value: string): LobbyCode {
    const trimmed = value.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(trimmed)) {
      throw new Error(
        `Invalid LobbyCode format: "${value}". Expected 6 alphanumeric characters (A-Z, 0-9).`,
      );
    }
    return new LobbyCode(trimmed);
  }

  equals(other: LobbyCode): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
