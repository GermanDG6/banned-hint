import { Card } from '../entities/card.entity';

export const CARD_REPOSITORY = Symbol('CardRepository');

export interface CardRepository {
  findRandom(): Promise<Card | null>;
}
