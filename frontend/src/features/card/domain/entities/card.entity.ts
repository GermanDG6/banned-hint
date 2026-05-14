import { CardId } from '../value-objects/card-id.value-object';
import { Word } from '../value-objects/word.value-object';
import { BannedWords } from '../value-objects/banned-words.value-object';

export class Card {
  readonly id: CardId;
  readonly word: Word;
  readonly bannedWords: BannedWords;

  private constructor(id: CardId, word: Word, bannedWords: BannedWords) {
    this.id = id;
    this.word = word;
    this.bannedWords = bannedWords;
  }

  static create(word: string, bannedWords: string[], id?: string): Card {
    const cardId = id ? CardId.from(id) : CardId.generate();
    const wordValueObject = Word.create(word);
    const bannedWordsValueObject = BannedWords.create(bannedWords);

    return new Card(cardId, wordValueObject, bannedWordsValueObject);
  }
}
