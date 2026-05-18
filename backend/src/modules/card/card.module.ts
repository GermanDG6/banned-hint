import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CardController } from './interfaces/http/controllers/card.controller';
import { GetRandomCardUseCase } from './application/use-cases/get-random-card.use-case';
import { CardSchema, CardSchemaFactory } from './infrastructure/persistence/schemas/card.schema';
import { MongoCardRepository } from './infrastructure/persistence/repositories/mongo-card.repository';
import { CARD_REPOSITORY } from './domain/repositories/card.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: CardSchema.name, schema: CardSchemaFactory }])],
  controllers: [CardController],
  providers: [
    GetRandomCardUseCase,
    {
      provide: CARD_REPOSITORY,
      useClass: MongoCardRepository,
    },
  ],
})
export class CardModule {}
