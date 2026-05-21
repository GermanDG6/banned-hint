import { Lobby } from './lobby.entity';
import { Player } from './player.entity';
import { LobbyCode } from '../value-objects/lobby-code.value-object';
import { PlayerRoleType } from '../value-objects/player-role.value-object';
import { LobbyStatusType } from '../value-objects/lobby-status.value-object';
import { DescriberAlreadyExistsException } from '../exceptions/describer-already-exists.exception';
import { LobbyId } from '../value-objects/lobby-id.value-object';

describe('Lobby', () => {
  let lobbyCode: LobbyCode;
  let describer: Player;
  let guesser1: Player;
  let guesser2: Player;

  beforeEach(() => {
    lobbyCode = LobbyCode.from('TEST01');
    describer = Player.create('socket-1', 'Alice', PlayerRoleType.Describer);
    guesser1 = Player.create('socket-2', 'Bob', PlayerRoleType.Guesser);
    guesser2 = Player.create('socket-3', 'Charlie', PlayerRoleType.Guesser);
  });

  describe('create', () => {
    it('should create a new Lobby with host as describer', () => {
      const lobby = Lobby.create(lobbyCode, describer);

      expect(lobby.code).toBe(lobbyCode);
      expect(lobby.getStatus()).toBe('waiting');
      expect(lobby.getPlayers()).toHaveLength(1);
      expect(lobby.getPlayers()[0].id).toBe('socket-1');
    });

    it('should have no round session initially', () => {
      const lobby = Lobby.create(lobbyCode, describer);

      expect(lobby.getRoundSession()).toBeNull();
    });
  });

  describe('join', () => {
    it('should add a guesser to the lobby', () => {
      const lobby = Lobby.create(lobbyCode, describer);
      lobby.join(guesser1);

      expect(lobby.getPlayers()).toHaveLength(2);
      expect(lobby.getPlayers()[1].id).toBe('socket-2');
    });

    it('should add multiple guessers without error', () => {
      const lobby = Lobby.create(lobbyCode, describer);
      lobby.join(guesser1);
      lobby.join(guesser2);

      expect(lobby.getPlayers()).toHaveLength(3);
      expect(lobby.getPlayers().map((p) => p.id)).toEqual(['socket-1', 'socket-2', 'socket-3']);
    });

    it('should throw DescriberAlreadyExistsException when joining a second describer', () => {
      const secondDescriber = Player.create('socket-99', 'Diana', PlayerRoleType.Describer);
      const lobby = Lobby.create(lobbyCode, describer);

      expect(() => lobby.join(secondDescriber)).toThrow(DescriberAlreadyExistsException);
    });

    it('should not change lobby status when joining', () => {
      const lobby = Lobby.create(lobbyCode, describer);
      lobby.join(guesser1);

      expect(lobby.getStatus()).toBe('waiting');
    });
  });

  describe('startRound', () => {
    it('should start a round and change status to playing', () => {
      const lobby = Lobby.create(lobbyCode, describer);
      const roundSession = lobby.startRound(
        'card-123',
        'apple',
        ['fruit', 'red', 'sweet', 'crunchy'],
        60,
      );

      expect(lobby.getStatus()).toBe('playing');
      expect(roundSession.cardId).toBe('card-123');
      expect(roundSession.word).toBe('apple');
      expect(roundSession.durationSeconds).toBe(60);
      expect(roundSession.bannedWords).toEqual(['fruit', 'red', 'sweet', 'crunchy']);
      expect(typeof roundSession.startAt).toBe('number');
    });

    it('should set startAt to approximately now', () => {
      const before = Date.now();
      const lobby = Lobby.create(lobbyCode, describer);
      const roundSession = lobby.startRound(
        'card-123',
        'apple',
        ['fruit', 'red', 'sweet', 'crunchy'],
        60,
      );
      const after = Date.now();

      expect(roundSession.startAt).toBeGreaterThanOrEqual(before);
      expect(roundSession.startAt).toBeLessThanOrEqual(after);
    });
  });

  describe('nextCard', () => {
    it('should update the round session with new card', () => {
      const lobby = Lobby.create(lobbyCode, describer);
      lobby.startRound('card-123', 'apple', ['fruit', 'red', 'sweet', 'crunchy'], 60);
      const originalRoundSession = lobby.getRoundSession()!;

      const newRoundSession = lobby.nextCard('card-456', 'banana', [
        'yellow',
        'peel',
        'monkey',
        'soft',
      ]);

      expect(newRoundSession.cardId).toBe('card-456');
      expect(newRoundSession.word).toBe('banana');
      expect(newRoundSession.bannedWords).toEqual(['yellow', 'peel', 'monkey', 'soft']);
      expect(newRoundSession.durationSeconds).toBe(60); // Duration stays the same
      expect(newRoundSession.startAt).toBeGreaterThanOrEqual(originalRoundSession.startAt);
    });

    it('should keep status as playing after nextCard', () => {
      const lobby = Lobby.create(lobbyCode, describer);
      lobby.startRound('card-123', 'apple', ['fruit', 'red', 'sweet', 'crunchy'], 60);
      lobby.nextCard('card-456', 'banana', ['yellow', 'peel', 'monkey', 'soft']);

      expect(lobby.getStatus()).toBe('playing');
    });

    it('should throw error if no round session active', () => {
      const lobby = Lobby.create(lobbyCode, describer);

      expect(() =>
        lobby.nextCard('card-456', 'banana', ['yellow', 'peel', 'monkey', 'soft']),
      ).toThrow('No round session active');
    });
  });

  describe('isDescriber', () => {
    it('should return true for the describer', () => {
      const lobby = Lobby.create(lobbyCode, describer);

      expect(lobby.isDescriber('socket-1')).toBe(true);
    });

    it('should return false for a guesser', () => {
      const lobby = Lobby.create(lobbyCode, describer);
      lobby.join(guesser1);

      expect(lobby.isDescriber('socket-2')).toBe(false);
    });

    it('should return false for a non-existent player', () => {
      const lobby = Lobby.create(lobbyCode, describer);

      expect(lobby.isDescriber('socket-unknown')).toBe(false);
    });
  });

  describe('findDescriber', () => {
    it('should return the describer player', () => {
      const lobby = Lobby.create(lobbyCode, describer);
      lobby.join(guesser1);
      lobby.join(guesser2);

      const foundDescriber = lobby.findDescriber();

      expect(foundDescriber).toBeDefined();
      expect(foundDescriber!.id).toBe('socket-1');
      expect(foundDescriber!.isDescriber()).toBe(true);
    });
  });

  describe('validateDescriberOnly', () => {
    it('should not throw if player is describer', () => {
      const lobby = Lobby.create(lobbyCode, describer);

      expect(() => lobby.validateDescriberOnly('socket-1')).not.toThrow();
    });

    it('should throw OnlyDescriberCanException if player is not describer', () => {
      const lobby = Lobby.create(lobbyCode, describer);
      lobby.join(guesser1);

      expect(() => lobby.validateDescriberOnly('socket-2')).toThrow(
        'Only the describer can perform this action',
      );
    });
  });

  describe('findGuesserById', () => {
    it('should return the guesser with the given playerId', () => {
      const lobby = Lobby.create(lobbyCode, describer);
      lobby.join(guesser1);

      const found = lobby.findGuesserById(guesser1.id);

      expect(found).toBeDefined();
      expect(found!.name).toBe('Bob');
      expect(found!.isGuesser()).toBe(true);
    });

    it('should return undefined when no guesser with that playerId exists', () => {
      const lobby = Lobby.create(lobbyCode, describer);
      lobby.join(guesser1);

      const found = lobby.findGuesserById('unknown-player-id');

      expect(found).toBeUndefined();
    });

    it('should not match a describer even if ID matches', () => {
      const lobby = Lobby.create(lobbyCode, describer);

      const found = lobby.findGuesserById(describer.id);

      expect(found).toBeUndefined();
    });
  });

  describe('restore', () => {
    it('should restore a Lobby from persisted data', () => {
      const lobbyId = LobbyId.generate();
      const roundSession = {
        cardId: 'card-123',
        word: 'apple',
        startAt: Date.now(),
        durationSeconds: 60,
        bannedWords: ['fruit', 'red', 'sweet', 'crunchy'],
      };

      const restoredLobby = Lobby.restore(
        lobbyId,
        lobbyCode,
        [describer, guesser1],
        LobbyStatusType.Playing,
        roundSession,
      );

      expect(restoredLobby.id).toBe(lobbyId);
      expect(restoredLobby.code).toBe(lobbyCode);
      expect(restoredLobby.getPlayers()).toHaveLength(2);
      expect(restoredLobby.getStatus()).toBe('playing');
      expect(restoredLobby.getRoundSession()).toEqual(roundSession);
    });
  });
});
