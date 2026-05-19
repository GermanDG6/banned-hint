import { PlayerRoleVO, PlayerRole } from '../value-objects/player-role.value-object';

export class Player {
  readonly id: string;
  readonly name: string;
  readonly role: PlayerRoleVO;

  private constructor(id: string, name: string, role: PlayerRoleVO) {
    this.id = id;
    this.name = name;
    this.role = role;
  }

  static create(id: string, name: string, roleType: PlayerRole): Player {
    const playerRole = PlayerRoleVO.create(roleType);
    return new Player(id, name, playerRole);
  }

  isDescriber(): boolean {
    return this.role.isDescriber();
  }

  isGuesser(): boolean {
    return this.role.isGuesser();
  }
}
