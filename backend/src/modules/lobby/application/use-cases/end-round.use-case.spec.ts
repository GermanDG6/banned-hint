import { EndRoundUseCase, EndRoundInput } from './end-round.use-case';
import { Lobby } from '../../domain/entities/lobby.entity';
import { Player } from '../../domain/entities/player.entity';
import { LobbyCode } from '../../domain/value-objects/lobby-code.value-object';
import { PlayerRoleType } from '../../domain/value-objects/player-role.value-object';
import { LobbyRepository } from '../../domain/repositories/lobby.repository';
import { LobbyNotFoundException } from '../../domain/exceptions/lobby-not-found.exception';
import { OnlyDescriberCanException } from '../../domain/exceptions/only-describer-can.exception';
//TODO extract fake repository to own file
class FakeLobbyRepository implements LobbyRepository {
  private lobbies: Map<string, Lobby> = new Map();

  async save(lobby: Lobby): Promise<void> {
    this.lobbies.set(lobby.code.value, lobby);
  }

  async findByCode(code: string): Promise<Lobby | null> {
    return this.lobbies.get(code) || null;
  }
}

describe('EndRoundUseCase', () => {
  let endRoundUseCase: EndRoundUseCase;
  let repository: FakeLobbyRepository;
  let lobby: Lobby;
  const lobbyCode = LobbyCode.from('TEST01');
  const describer = Player.create('socket-1', 'Alice', PlayerRoleType.Describer);
  const guesser = Player.create('socket-2', 'Bob', PlayerRoleType.Guesser);

  beforeEach(async () => {
    repository = new FakeLobbyRepository();
    endRoundUseCase = new EndRoundUseCase(repository);

    // Create and save a lobby with an active round
    lobby = Lobby.create(lobbyCode, describer);
    lobby.join(guesser);
    lobby.startRound('card-123', 'apple', ['fruit', 'red', 'sweet', 'crunchy'], 60);
    await repository.save(lobby);
  });

  describe('execute', () => {
    it('should end the round when describer emits end-round', async () => {
      const input: EndRoundInput = {
        lobbyCode: 'TEST01',
        playerId: 'socket-1',
      };

      await endRoundUseCase.execute(input);

      const updatedLobby = await repository.findByCode('TEST01');
      expect(updatedLobby!.getStatus()).toBe('waiting');
      expect(updatedLobby!.getRoundSession()).toBeNull();
    });

    it('should throw OnlyDescriberCanException when guesser tries to end round', async () => {
      const input: EndRoundInput = {
        lobbyCode: 'TEST01',
        playerId: 'socket-2',
      };

      await expect(endRoundUseCase.execute(input)).rejects.toThrow(OnlyDescriberCanException);
    });

    it('should throw LobbyNotFoundException when lobby does not exist', async () => {
      const input: EndRoundInput = {
        lobbyCode: 'INVALID',
        playerId: 'socket-1',
      };

      await expect(endRoundUseCase.execute(input)).rejects.toThrow(LobbyNotFoundException);
    });
  });
});
