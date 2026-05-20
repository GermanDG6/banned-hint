import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpCardRepository } from './http-card.repository';
import { HttpClient } from '@/shared/http/http-client.port.ts';
import { CardApiResponse } from './card-api-response.type';

describe('HttpCardRepository', () => {
  let repository: HttpCardRepository;
  let getMock: ReturnType<typeof vi.fn>;
  let httpClientMock: HttpClient;

  beforeEach(() => {
    getMock = vi.fn();
    httpClientMock = {
      get: getMock,
      post: vi.fn(),
    } as HttpClient;
    repository = new HttpCardRepository(httpClientMock);
  });

  it('should return a Card when API returns a valid response', async () => {
    const mockApiResponse: CardApiResponse = {
      id: 'test-id-1',
      word: 'apple',
      bannedWords: ['red', 'fruit', 'tree', 'sweet'],
    };
    getMock.mockResolvedValue(mockApiResponse);

    const card = await repository.findRandom();

    expect(card).toBeDefined();
    expect(card?.id.value).toBe('test-id-1');
    expect(card?.word.value).toBe('apple');
    expect(card?.bannedWords.toArray()).toEqual(['red', 'fruit', 'tree', 'sweet']);
    expect(httpClientMock.get).toHaveBeenCalledWith('http://localhost:3000/api/cards/random');
  });

  it('should map API response to Card entity correctly', async () => {
    const mockApiResponse: CardApiResponse = {
      id: 'card-uuid',
      word: 'banana',
      bannedWords: ['yellow', 'fruit', 'peel', 'tropical'],
    };
    getMock.mockResolvedValue(mockApiResponse);

    const card = await repository.findRandom();

    expect(card?.word.value).toBe('banana');
    expect(card?.bannedWords.toArray()).toEqual(['yellow', 'fruit', 'peel', 'tropical']);
  });

  it('should throw an error if httpClient throws', async () => {
    const error = new Error('API Error');
    getMock.mockRejectedValue(error);

    await expect(repository.findRandom()).rejects.toThrow('API Error');
  });

  it('should call httpClient.get with correct API endpoint', async () => {
    const mockApiResponse: CardApiResponse = {
      id: 'test-id',
      word: 'test',
      bannedWords: ['word', 'exam', 'trial', 'check'],
    };
    getMock.mockResolvedValue(mockApiResponse);

    await repository.findRandom();

    expect(getMock).toHaveBeenCalledTimes(1);
    expect(getMock).toHaveBeenCalledWith('http://localhost:3000/api/cards/random');
  });
});
