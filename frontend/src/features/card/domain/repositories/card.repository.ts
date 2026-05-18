import { Card } from '../entities/card.entity';

export interface CardRepository {
  findRandom(): Promise<Card | null>;
}
