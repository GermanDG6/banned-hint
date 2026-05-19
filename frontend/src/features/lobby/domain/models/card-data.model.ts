export interface CardData {
  id: string;
  word: string;
  bannedWords: string[];
}

/**
 * CardData es un tipo plano que representa los datos de una Card
 * en el contexto de una partida multijugador.
 * Se define como tipo separado para evitar acoplamiento con la feature `card`.
 * Solo lo ve el Describer; los Guessers nunca reciben estos datos.
 */
