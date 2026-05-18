import { Card } from '../entities/card.entity';

export class CardMother {
  static valid(): Card {
    return Card.create('apple', ['red', 'fruit', 'tree', 'sweet']);
  }

  static withWord(word: string): Card {
    return Card.create(word, ['banned1', 'banned2', 'banned3', 'banned4']);
  }

  static withBannedWords(bannedWords: string[]): Card {
    return Card.create('apple', bannedWords);
  }

  static withIdAndWord(id: string, word: string): Card {
    return Card.create(word, ['banned1', 'banned2', 'banned3', 'banned4'], id);
  }
}
