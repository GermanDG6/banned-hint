import { PlayerRoleType, PlayerRole } from '../models/player.model';
import { PlayerId } from '../value-objects/player-id.value-object';
import { InvalidPlayerNameException } from '../exceptions/invalid-player-name.exception';
import { InvalidPlayerRoleException } from '../exceptions/invalid-player-role.exception';
import { InvalidPlayerIdException } from '../exceptions/invalid-player-id.exception';

export class Player {
  readonly id: PlayerId;
  readonly name: string;
  readonly role: PlayerRole;

  private constructor(id: PlayerId, name: string, role: PlayerRole) {
    this.id = id;
    this.name = name;
    this.role = role;
  }

  static create(name: string, role: string, id?: string): Player {
    const playerId = id !== undefined ? PlayerId.create(id) : PlayerId.generate();

    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new InvalidPlayerNameException(name);
    }

    if (role !== PlayerRoleType.Describer && role !== PlayerRoleType.Guesser) {
      throw new InvalidPlayerRoleException(role);
    }

    return new Player(playerId, name.trim(), role as PlayerRole);
  }

  static fromRaw(data: unknown): Player {
    //TODO DELETE METHOD
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
    return Player.create(name, role, id);
  }

  getId() {
    return this.id.value();
  }
}
