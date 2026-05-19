import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'cards' })
export class CardSchema {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true })
  word: string;

  @Prop({ type: [String], required: true })
  bannedWords: string[];
}

export type CardDocument = HydratedDocument<CardSchema>;

export const CardSchemaFactory = SchemaFactory.createForClass(CardSchema);
