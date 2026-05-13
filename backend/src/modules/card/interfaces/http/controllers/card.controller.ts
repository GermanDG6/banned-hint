import { Controller, Get, UseFilters } from '@nestjs/common';
import { GetRandomCardUseCase } from '../../../application/use-cases/get-random-card.use-case';
import { CardDto } from '../../../application/dtos/card.dto';
import { CardNotFoundExceptionFilter } from '../filters/card-not-found.exception-filter';

@Controller('cards')
export class CardController {
  constructor(private readonly getRandomCardUseCase: GetRandomCardUseCase) {}

  @Get('random')
  @UseFilters(CardNotFoundExceptionFilter)
  async getRandomCard(): Promise<CardDto> {
    return this.getRandomCardUseCase.execute();
  }
}
