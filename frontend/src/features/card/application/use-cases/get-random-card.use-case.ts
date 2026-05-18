import { Card } from '../../domain/entities/card.entity';
import { CardNotFoundException } from '../../domain/exceptions/card-not-found.exception';
import { CardRepository } from '../ports/card-repository.port';

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
