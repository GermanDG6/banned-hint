import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CardRepository } from '../../../domain/repositories/card.repository';
import { Card } from '../../../domain/entities/card.entity';
import { CardSchema } from '../schemas/card.schema';

@Injectable()
export class MongoCardRepository implements CardRepository {
  constructor(@InjectModel(CardSchema.name) private cardModel: Model<CardSchema>) {}

  async findRandom(): Promise<Card | null> {
    const result = await this.cardModel.aggregate([{ $sample: { size: 1 } }]).exec();

    if (!result || result.length === 0) {
      return null;
    }

    const doc = result[0];

    return Card.create(doc.word, doc.bannedWords, doc._id);
  }
}

// TODO revisar lógica para random : realmente se está haciendo un random? o se está devolviendo la primera ocurrencia? revisar si el método aggregate con $sample es la mejor opción para obtener un documento aleatorio de la colección.
