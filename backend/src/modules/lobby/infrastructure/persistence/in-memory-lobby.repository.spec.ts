import { InMemoryLobbyRepository } from './in-memory-lobby.repository';
import { Lobby } from '../../domain/entities/lobby.entity';
import { LobbyCode } from '../../domain/value-objects/lobby-code.value-object';
import { Player } from '../../domain/entities/player.entity';
import { PlayerRoleType } from '../../domain/value-objects/player-role.value-object';

describe('InMemoryLobbyRepository', () => {
  let repository: InMemoryLobbyRepository;

  beforeEach(() => {
    repository = new InMemoryLobbyRepository();
  });

  describe('save', () => {
    it('should persist a Lobby in memory', async () => {
      const code = LobbyCode.generate();
      const player = Player.create('player-1', 'Alice', PlayerRoleType.Describer);
      const lobby = Lobby.create(code, player);

      await repository.save(lobby);

      const retrieved = await repository.findByCode(code.value);
      expect(retrieved).toBeDefined();
      expect(retrieved?.code.value).toBe(code.value);
    });

    it('should overwrite an existing Lobby with the same code', async () => {
      const code = LobbyCode.generate();
      const player1 = Player.create('player-1', 'Alice', PlayerRoleType.Describer);
      const lobby1 = Lobby.create(code, player1);

      await repository.save(lobby1);

      const player2 = Player.create('player-2', 'Bob', PlayerRoleType.Guesser);
      lobby1.join(player2);
      await repository.save(lobby1);

      const retrieved = await repository.findByCode(code.value);
      expect(retrieved?.getPlayers().length).toBe(2);
    });
  });

  describe('findByCode', () => {
    it('should return a Lobby when it exists', async () => {
      const code = LobbyCode.generate();
      const player = Player.create('player-1', 'Alice', PlayerRoleType.Describer);
      const lobby = Lobby.create(code, player);

      await repository.save(lobby);
      const retrieved = await repository.findByCode(code.value);

      expect(retrieved).toBeDefined();
      expect(retrieved?.code.value).toBe(code.value);
      expect(retrieved?.id).toBe(lobby.id);
    });

    it('should return null when Lobby does not exist', async () => {
      const result = await repository.findByCode('NONEXISTENT');

      expect(result).toBeNull();
    });

    it('should preserve Lobby state after retrieval', async () => {
      const code = LobbyCode.generate();
      const player1 = Player.create('player-1', 'Alice', PlayerRoleType.Describer);
      const lobby = Lobby.create(code, player1);

      const player2 = Player.create('player-2', 'Bob', PlayerRoleType.Guesser);
      lobby.join(player2);

      await repository.save(lobby);
      const retrieved = await repository.findByCode(code.value);

      expect(retrieved?.getPlayers().length).toBe(2);
      expect(retrieved?.getStatus()).toBe('waiting');
    });

    it('should return the exact same instance after save and retrieve', async () => {
      const code = LobbyCode.generate();
      const player = Player.create('player-1', 'Alice', PlayerRoleType.Describer);
      const lobby = Lobby.create(code, player);

      await repository.save(lobby);
      const retrieved = await repository.findByCode(code.value);

      expect(retrieved).toBe(lobby);
    });
  });

  describe('isolation', () => {
    it('should store multiple Lobbies independently', async () => {
      const code1 = LobbyCode.generate();
      const code2 = LobbyCode.generate();

      const player1 = Player.create('player-1', 'Alice', PlayerRoleType.Describer);
      const lobby1 = Lobby.create(code1, player1);

      const player2 = Player.create('player-2', 'Bob', PlayerRoleType.Describer);
      const lobby2 = Lobby.create(code2, player2);

      await repository.save(lobby1);
      await repository.save(lobby2);

      const retrieved1 = await repository.findByCode(code1.value);
      const retrieved2 = await repository.findByCode(code2.value);

      expect(retrieved1?.code.value).toBe(code1.value);
      expect(retrieved2?.code.value).toBe(code2.value);
      expect(retrieved1).not.toBe(retrieved2);
    });
  });
});
