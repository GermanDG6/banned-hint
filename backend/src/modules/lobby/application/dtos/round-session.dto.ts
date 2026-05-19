import { CardDto } from '../../../card/application/dtos/card.dto';
import { RoundSession } from '../../domain/models/round-session.model';

export class RoundSessionDto {
  startAt: number;
  durationSeconds: number;
  card?: CardDto;

  constructor(roundSession: RoundSession, card?: CardDto) {
    this.startAt = roundSession.startAt;
    this.durationSeconds = roundSession.durationSeconds;
    this.card = card;
  }
}
