import { Injectable } from '@nestjs/common';
import { CardRepository } from '../../../domain/repositories/card.repository';
import { Card } from '../../../domain/entities/card.entity';
import { CardMother } from '../../../domain/testing/card.mother';

@Injectable()
export class FakeCardRepository implements CardRepository {
  private readonly cards: Card[] = CardMother.validCards();

  async findRandom(): Promise<Card | null> {
    if (this.cards.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * this.cards.length);
    return this.cards[randomIndex];
  }
}
