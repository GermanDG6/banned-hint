import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpLobbyRepository } from './http-lobby.repository';
import { HttpClient } from '@/shared/http/http-client.port';
import { HttpClientException } from '@/shared/http/http-client.exception';
import { InvalidPlayerRoleException } from '../../domain/exceptions/invalid-player-role.exception';
import { LobbyApiResponse } from './lobby-api-response.type';

describe('HttpLobbyRepository', () => {
  let repository: HttpLobbyRepository;
  let httpClientMock: HttpClient;
  const validUUID1 = '550e8400-e29b-41d4-a716-446655440000';
  const validUUID2 = '550e8400-e29b-41d4-a716-446655440001';
  const validUUID3 = '550e8400-e29b-41d4-a716-446655440002';

  beforeEach(() => {
    httpClientMock = {
      get: vi.fn(),
      post: vi.fn(),
    };
    repository = new HttpLobbyRepository(httpClientMock);
  });

  describe('createLobby', () => {
    it('should call httpClient.post with correct parameters', async () => {
      const mockResponse = {
        code: 'ABC123',
        playerId: validUUID1,
        role: 'describer' as const,
      };
      vi.mocked(httpClientMock.post).mockResolvedValue(mockResponse);

      const result = await repository.createLobby('John', validUUID1);

      expect(httpClientMock.post).toHaveBeenCalledWith('http://localhost:3000/api/lobby', {
        playerName: 'John',
        playerId: validUUID1,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should return { code, playerId, role } from the API', async () => {
      const expected = {
        code: 'XYZ789',
        playerId: validUUID2,
        role: 'describer' as const,
      };
      vi.mocked(httpClientMock.post).mockResolvedValue(expected);

      const result = await repository.createLobby('Alice', validUUID2);

      expect(result.code).toBe('XYZ789');
      expect(result.playerId).toBe(validUUID2);
      expect(result.role).toBe('describer');
    });

    it('should propagate errors from httpClient.post', async () => {
      const error = new Error('Network error');
      vi.mocked(httpClientMock.post).mockRejectedValue(error);

      await expect(repository.createLobby('John', validUUID1)).rejects.toThrow('Network error');
    });

    it('should throw InvalidPlayerRoleException when role in API response is invalid', async () => {
      const mockResponse = {
        code: 'ABC123',
        playerId: validUUID1,
        role: 'invalid-role',
      };
      vi.mocked(httpClientMock.post).mockResolvedValue(mockResponse);

      await expect(repository.createLobby('John', validUUID1)).rejects.toThrow(
        InvalidPlayerRoleException,
      );
    });
  });

  describe('getLobby', () => {
    it('should return Lobby when API returns 200 with valid data', async () => {
      const mockResponse: LobbyApiResponse = {
        code: 'ABC123',
        status: 'waiting',
        players: [
          { id: validUUID1, name: 'John', role: 'describer' },
          { id: validUUID2, name: 'Alice', role: 'guesser' },
        ],
      };
      vi.mocked(httpClientMock.get).mockResolvedValue(mockResponse);

      const result = await repository.getLobby('ABC123');

      expect(httpClientMock.get).toHaveBeenCalledWith('http://localhost:3000/api/lobby/ABC123');
      expect(result).toBeDefined();
      expect(result?.code).toBe('ABC123');
      expect(result?.status).toBe('waiting');
      expect(result?.players).toHaveLength(2);
      expect(result?.players[0].id.value).toBe(validUUID1);
      expect(result?.players[0].name).toBe('John');
      expect(result?.players[0].role).toBe('describer');
      expect(result?.players[1].id.value).toBe(validUUID2);
      expect(result?.players[1].name).toBe('Alice');
      expect(result?.players[1].role).toBe('guesser');
    });

    it('should return null when API returns 404', async () => {
      const error = new HttpClientException(
        'Not Found',
        404,
        'http://localhost:3000/api/lobby/NOTFOUND',
      );
      vi.mocked(httpClientMock.get).mockRejectedValue(error);

      const result = await repository.getLobby('NOTFOUND');

      expect(result).toBeNull();
    });

    it('should propagate non-404 errors', async () => {
      const error = new HttpClientException(
        'Internal Server Error',
        500,
        'http://localhost:3000/api/lobby/ABC123',
      );
      vi.mocked(httpClientMock.get).mockRejectedValue(error);

      await expect(repository.getLobby('ABC123')).rejects.toThrow(HttpClientException);
      await expect(repository.getLobby('ABC123')).rejects.toMatchObject({ status: 500 });
    });

    it('should propagate network errors', async () => {
      const networkError = new Error('Network error');
      vi.mocked(httpClientMock.get).mockRejectedValue(networkError);

      await expect(repository.getLobby('ABC123')).rejects.toThrow('Network error');
    });

    it('should map multiple players correctly', async () => {
      const mockResponse: LobbyApiResponse = {
        code: 'ABC123',
        status: 'playing',
        players: [
          { id: validUUID1, name: 'Player 1', role: 'describer' },
          { id: validUUID2, name: 'Player 2', role: 'guesser' },
          { id: validUUID3, name: 'Player 3', role: 'guesser' },
        ],
      };
      vi.mocked(httpClientMock.get).mockResolvedValue(mockResponse);

      const result = await repository.getLobby('ABC123');

      expect(result?.players).toHaveLength(3);
      expect(result?.players[0].role).toBe('describer');
      expect(result?.players[1].role).toBe('guesser');
      expect(result?.players[2].role).toBe('guesser');
    });

    it('should throw InvalidPlayerRoleException when player role is invalid', async () => {
      const mockResponse: LobbyApiResponse = {
        code: 'ABC123',
        status: 'waiting',
        players: [{ id: validUUID1, name: 'John', role: 'invalid-role' }],
      };
      vi.mocked(httpClientMock.get).mockResolvedValue(mockResponse);

      await expect(repository.getLobby('ABC123')).rejects.toThrow(InvalidPlayerRoleException);
    });
  });
});
