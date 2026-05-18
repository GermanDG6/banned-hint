import { Card } from '../../domain/entities/card.entity';

export interface CardRepository {
  findRandom(): Promise<Card | null>;
}
