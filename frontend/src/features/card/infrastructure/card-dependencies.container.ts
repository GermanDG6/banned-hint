import { GetRandomCard } from '../application/use-cases/get-random-card.use-case';
import { HttpCardRepository } from './api/http-card.repository';
import { FetchHttpClient } from '@/shared/http/fetch-http-client.ts';

const httpClient = new FetchHttpClient();
const cardRepository = new HttpCardRepository(httpClient);
const getRandomCard = new GetRandomCard(cardRepository);

export const cardContainer = {
  getRandomCard,
} as const;
