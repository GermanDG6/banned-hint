import { Card } from '../entities/card.entity';

export class CardMother {
  static valid(): Card {
    return Card.create('apple', ['red', 'fruit']);
  }

  static withWord(word: string): Card {
    return Card.create(word, ['banned1', 'banned2']);
  }

  static withBannedWords(bannedWords: string[]): Card {
    return Card.create('apple', bannedWords);
  }

  static withIdAndWord(id: string, word: string): Card {
    return Card.create(word, ['banned1', 'banned2'], id);
  }
}
