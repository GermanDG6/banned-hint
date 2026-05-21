export interface RoundSession {
  cardId: string;
  word: string;
  bannedWords: string[];
  startAt: number;
  durationSeconds: number;
}
