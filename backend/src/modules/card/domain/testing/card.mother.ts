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

  static validCards(): Card[] {
    return [
      Card.create('cat', ['animal', 'pet', 'dog', 'meow']),
      Card.create('piano', ['music', 'instrument', 'keys', 'play']),
      Card.create('sunset', ['sun', 'evening', 'dusk', 'orange']),
      Card.create('book', ['paper', 'read', 'story', 'pages']),
      Card.create('mountain', ['peak', 'high', 'rock', 'climb']),
    ];
  }
}
