import { Card } from '../../domain/entities/card.entity';
import { CardNotFoundException } from '../../domain/exceptions/card-not-found.exception';
import { CardRepository } from '../../domain/repositories/card.repository';

export class GetRandomCard {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(): Promise<Card> {
    const card = await this.cardRepository.findRandom();

    if (!card) {
      throw new CardNotFoundException('No cards available');
    }

    return card;
  }
}
