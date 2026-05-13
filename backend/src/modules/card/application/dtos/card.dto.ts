export class CardDto {
  id: string;
  word: string;
  bannedWords: string[];

  constructor(id: string, word: string, bannedWords: string[]) {
    this.id = id;
    this.word = word;
    this.bannedWords = bannedWords;
  }
}
