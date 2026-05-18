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

  static validCards(): Card[] {
    return [
      Card.create('cat', ['animal', 'pet', 'dog', 'Garfield']),
      Card.create('piano', ['music', 'instrument', 'keys', 'play']),
      Card.create('sunset', ['sun', 'evening']),
      Card.create('book', ['paper', 'read']),
      Card.create('mountain', ['peak', 'high']),
    ];
  }
}
