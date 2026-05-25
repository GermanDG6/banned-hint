import { PlayerRoleType, PlayerRole } from '../models/player.model';
import { InvalidPlayerIdException } from '../exceptions/invalid-player-id.exception';
import { InvalidPlayerNameException } from '../exceptions/invalid-player-name.exception';
import { InvalidPlayerRoleException } from '../exceptions/invalid-player-role.exception';

export class Player {
  readonly id: string;
  readonly name: string;
  readonly role: PlayerRole;

  private constructor(id: string, name: string, role: PlayerRole) {
    this.id = id;
    this.name = name;
    this.role = role;
  }

  static create(id: string, name: string, role: string): Player {
    // Validate id
    if (typeof id !== 'string' || id.trim().length === 0) {
      throw new InvalidPlayerIdException(id);
    }

    // Validate name
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new InvalidPlayerNameException(name);
    }

    // Validate role
    if (role !== PlayerRoleType.Describer && role !== PlayerRoleType.Guesser) {
      throw new InvalidPlayerRoleException(role);
    }

    return new Player(id.trim(), name.trim(), role as PlayerRole);
  }

  static fromRaw(data: unknown): Player {
    // Type guard to ensure data has the expected shape
    if (typeof data !== 'object' || data === null) {
      throw new InvalidPlayerIdException(data);
    }

    const record = data as Record<string, unknown>;

    const id = record.id;
    const name = record.name;
    const role = record.role;

    // Validate id exists and is a string
    if (typeof id !== 'string') {
      throw new InvalidPlayerIdException(id);
    }

    // Validate name exists and is a string
    if (typeof name !== 'string') {
      throw new InvalidPlayerNameException(name);
    }

    // Validate role exists and is a string
    if (typeof role !== 'string') {
      throw new InvalidPlayerRoleException(role);
    }

    // Delegate to create() for final validation and creation
    return Player.create(id, name, role);
  }
}
