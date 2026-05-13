import { Injectable, Inject } from '@nestjs/common';
import { CardRepository, CARD_REPOSITORY } from '../../domain/repositories/card.repository';
import { CardNotFoundException } from '../../domain/exceptions/card-not-found.exception';
import { CardDto } from '../dtos/card.dto';

@Injectable()
export class GetRandomCardUseCase {
  constructor(
    @Inject(CARD_REPOSITORY)
    private readonly cardRepository: CardRepository,
  ) {}

  async execute(): Promise<CardDto> {
    const card = await this.cardRepository.findRandom();

    if (!card) {
      throw new CardNotFoundException('No cards available');
    }

    return new CardDto(card.id.value, card.word.value, card.bannedWords.toArray());
  }
}
