import { CardData } from '@/features/lobby/domain/models/card-data.model.ts';

export interface RoundSession {
  startAt: number; // Unix timestamp en ms
  durationSeconds: number;
  card?: CardData; // solo presente para el Describer
}
