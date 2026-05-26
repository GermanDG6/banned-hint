import { describe, it, expect, vi } from 'vitest';
import { CreateLobby } from './create-lobby.use-case';
import { LobbyHttpPort } from '../ports/lobby-http.port';
import { Player } from '@/features/lobby/domain/entities/player.entity.ts';
import { PlayerId } from '@/features/lobby/domain/value-objects/player-id.value-object.ts';

describe('CreateLobby', () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000';

  it('should call lobbyHttpPort.createLobby with correct parameters and return the result', async () => {
    const fakeHttpPort: LobbyHttpPort = {
      createLobby: vi.fn().mockResolvedValue({
        code: 'ABC123',
        playerId: validUUID,
        role: 'describer',
      }),
      getLobby: vi.fn(),
    };
    const playerId: PlayerId = PlayerId.create(validUUID);
    vi.spyOn(Player, 'create').mockReturnValue({
      id: playerId,
      name: 'John',
      role: 'describer',
      getId: () => validUUID,
    });
    const createLobby = new CreateLobby(fakeHttpPort);
    const result = await createLobby.execute('John');

    expect(fakeHttpPort.createLobby).toHaveBeenCalledWith('John', validUUID);
    expect(result).toEqual({
      code: 'ABC123',
      playerId: validUUID,
      role: 'describer',
    });
  });

  it('should propagate errors from the HTTP port', async () => {
    const fakeHttpPort: LobbyHttpPort = {
      createLobby: vi.fn().mockRejectedValue(new Error('Network error')),
      getLobby: vi.fn(),
    };

    const createLobby = new CreateLobby(fakeHttpPort);

    await expect(createLobby.execute('John')).rejects.toThrow('Network error');
  });
});
