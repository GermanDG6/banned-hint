import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FetchHttpClient } from './fetch-http-client';
import { HttpClientException } from './http-client.exception';

describe('FetchHttpClient', () => {
  let httpClient: FetchHttpClient;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    httpClient = new FetchHttpClient();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('get', () => {
    it('should return parsed JSON when response is ok', async () => {
      const mockData = { id: '123', word: 'test', bannedWords: ['a', 'b'] };
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await httpClient.get('/api/test');

      expect(result).toEqual(mockData);
      expect(fetchMock).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should throw HttpClientException when response is not ok', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(httpClient.get('/api/not-found')).rejects.toThrow(HttpClientException);
    });

    it('should include status and url in HttpClientException', async () => {
      const testUrl = '/api/error';
      const testStatus = 500;
      fetchMock.mockResolvedValue({
        ok: false,
        status: testStatus,
        statusText: 'Internal Server Error',
      });

      try {
        await httpClient.get(testUrl);
        expect.fail('Should have thrown an error');
      } catch (error) {
        if (error instanceof HttpClientException) {
          expect(error.status).toBe(testStatus);
          expect(error.url).toBe(testUrl);
        } else {
          throw error;
        }
      }
    });

    it('should handle fetch network errors', async () => {
      const networkError = new Error('Network error');
      fetchMock.mockRejectedValue(networkError);

      await expect(httpClient.get('/api/test')).rejects.toThrow('Network error');
    });
  });

  describe('post', () => {
    it('should send JSON body and return parsed response when ok', async () => {
      const mockData = { code: 'ABC123', playerId: 'player-1', role: 'describer' };
      const requestBody = { playerName: 'John', durationSeconds: 60 };

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await httpClient.post('/api/lobby', requestBody);

      expect(result).toEqual(mockData);
      expect(fetchMock).toHaveBeenCalledWith('/api/lobby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
    });

    it('should throw HttpClientException when post response is not ok', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
      });

      await expect(httpClient.post('/api/lobby', {})).rejects.toThrow(HttpClientException);
    });

    it('should include status and url in post error exception', async () => {
      const testUrl = '/api/lobby';
      const testStatus = 500;
      fetchMock.mockResolvedValue({
        ok: false,
        status: testStatus,
        statusText: 'Internal Server Error',
      });

      try {
        await httpClient.post(testUrl, {});
        expect.fail('Should have thrown an error');
      } catch (error) {
        if (error instanceof HttpClientException) {
          expect(error.status).toBe(testStatus);
          expect(error.url).toBe(testUrl);
        } else {
          throw error;
        }
      }
    });

    it('should handle post network errors', async () => {
      const networkError = new Error('Network error');
      fetchMock.mockRejectedValue(networkError);

      await expect(httpClient.post('/api/lobby', {})).rejects.toThrow('Network error');
    });

    it('should serialize complex objects correctly', async () => {
      const complexBody = {
        playerName: 'Alice',
        durationSeconds: 120,
        metadata: { theme: 'dark' },
      };

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      await httpClient.post('/api/lobby', complexBody);

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/lobby',
        expect.objectContaining({
          body: JSON.stringify(complexBody),
        }),
      );
    });
  });
});
