import { PlayerRole, PlayerRoleType } from '../value-objects/player-role.value-object';

export class Player {
  readonly id: string;
  readonly name: string;
  readonly role: PlayerRole;

  private constructor(id: string, name: string, role: PlayerRole) {
    this.id = id;
    this.name = name;
    this.role = role;
  }

  static create(id: string, name: string, roleType: PlayerRoleType): Player {
    const playerRole = PlayerRole.create(roleType);
    return new Player(id, name, playerRole);
  }

  isDescriber(): boolean {
    return this.role.isDescriber();
  }

  isGuesser(): boolean {
    return this.role.isGuesser();
  }

  getRole(): PlayerRoleType {
    return this.role.value;
  }
}
