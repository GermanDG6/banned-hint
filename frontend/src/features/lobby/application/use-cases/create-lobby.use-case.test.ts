import { describe, it, expect, vi } from 'vitest';
import { CreateLobby } from './create-lobby.use-case';
import { LobbyHttpPort } from '../ports/lobby-http.port';

describe('CreateLobby', () => {
  it('should call lobbyHttpPort.createLobby with correct parameters and return the result', async () => {
    const fakeHttpPort: LobbyHttpPort = {
      createLobby: vi.fn().mockResolvedValue({
        code: 'ABC123',
        playerId: 'player-1',
        role: 'describer',
      }),
      getLobby: vi.fn(),
    };

    const createLobby = new CreateLobby(fakeHttpPort);
    const result = await createLobby.execute('John', 60);

    expect(fakeHttpPort.createLobby).toHaveBeenCalledWith('John', 60);
    expect(result).toEqual({
      code: 'ABC123',
      playerId: 'player-1',
      role: 'describer',
    });
  });

  it('should propagate errors from the HTTP port', async () => {
    const fakeHttpPort: LobbyHttpPort = {
      createLobby: vi.fn().mockRejectedValue(new Error('Network error')),
      getLobby: vi.fn(),
    };

    const createLobby = new CreateLobby(fakeHttpPort);

    await expect(createLobby.execute('John', 60)).rejects.toThrow('Network error');
  });
});
