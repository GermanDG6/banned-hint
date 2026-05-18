import { CardRepository } from '../repositories/card.repository';
import { Card } from '../entities/card.entity';
import { CardMother } from './card.mother';

export class FakeCardRepository implements CardRepository {
  constructor(private card: Card | null = CardMother.valid()) {}

  async findRandom(): Promise<Card | null> {
    return this.card;
  }
}
