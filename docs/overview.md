# Dominio del juego Banned Hint

## Objetivo

Un jugador (`Describer`) debe conseguir que el resto (`Guessers`) adivinen la palabra objetivo de una carta sin decir ninguna de las palabras prohibidas, dentro de un tiempo limitado.

## Flujo de una partida multijugador

1. El host crea un `Lobby` en la pantalla de inicio e introduce su nombre de jugador y la duración de la ronda (`RoundConfig`).
2. El servidor genera un `LobbyCode` único y asigna al host el rol `Describer`.
3. El host comparte el `LobbyCode` con el resto de jugadores.
4. Los demás jugadores entran a la sala de espera (`WaitingRoom`) introduciendo el `LobbyCode` y su nombre. Se les asigna el rol `Guesser`.
5. El `Describer` pulsa «Iniciar ronda». El servidor selecciona una `Card` aleatoria y emite un evento `round-started` con la `ActiveCard`, el `startAt` (timestamp en ms) y la `durationSeconds`.
6. Cada cliente redirige automáticamente según su rol:
   - `Describer` → pantalla `/round`: ve la `word` y las `bannedWords`.
   - `Guesser` → pantalla `/round/guess`: ve solo el cronómetro y un campo de texto.
7. Los `Guessers` escriben sus intentos (`Guess`). El servidor valida cada intento y responde con `{ correct: boolean }` solo al `Guesser` emisor.
8. Si un `Guesser` acierta, ve la confirmación en pantalla.
9. El `Describer` pulsa «Siguiente» para cargar una nueva `Card`. El servidor emite `card-changed` con la nueva `ActiveCard` y un nuevo `startAt`.
10. Cuando el `Timer` llega a cero (calculado localmente por cada cliente a partir de `startAt + durationSeconds`), el servidor emite automáticamente un nuevo `card-changed`.

## Reglas principales

- La duración de la ronda debe ser mayor que cero (minutos ≥ 0, segundos ≥ 0, total > 0).
- Cada `Card` debe tener:
  - Una `word` no vacía.
  - Al menos 4 palabras en `bannedWords`.
- El `Describer` no puede usar ninguna palabra incluida en `bannedWords`.
- Solo puede haber un `Describer` por `Lobby`.
- La `Card` activa (word + bannedWords) **nunca** se envía al cliente con rol `Guesser`. La validación de un `Guess` ocurre en el servidor.
- El `Timer` se sincroniza entre clientes mediante el `startAt` emitido por el servidor: cada cliente calcula el tiempo restante como `durationSeconds - (Date.now() - startAt) / 1000`. No hay tick del servidor.
- Solo el `Describer` puede emitir los eventos `start-round` y `next-card`. El servidor rechaza estos eventos si el emisor tiene rol `Guesser`.
