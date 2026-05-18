import { CardRepository } from '../../application/ports/card-repository.port';
import { Card } from '../../domain/entities/card.entity';
import { HttpClient } from '@/shared/http/http-client.port.ts';
import { CardApiResponse } from './card-api-response.type';

export class HttpCardRepository implements CardRepository {
  private readonly apiUrl = '/api/cards/random';

  constructor(private readonly httpClient: HttpClient) {}

  async findRandom(): Promise<Card | null> {
    const response = await this.httpClient.get<CardApiResponse>(this.apiUrl);
    return Card.create(response.word, response.bannedWords, response.id);
  }
}
