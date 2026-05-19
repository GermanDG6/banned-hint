# Lenguaje ubicuo

- **Card**: tarjeta con la palabra objetivo (`word`) y una lista de palabras prohibidas (`bannedWords`).
- **CardId**: identificador único de una `Card`, representado como un UUID.
- **Word**: palabra que el equipo debe adivinar a partir de las pistas.
- **Banned word**: palabra que el jugador que describe no puede pronunciar al dar pistas.
- **Round**: intervalo de tiempo en el que se juega con una carta y un cronómetro activo.
- **Timer**: límite de tiempo de una `Round`, expresado en minutos y segundos. En modo multijugador el servidor emite un `startAt` (Unix timestamp en ms) y un `durationSeconds`; cada cliente calcula el tiempo restante como `durationSeconds - (Date.now() - startAt) / 1000`.
- **RoundConfig**: configuración elegida por el jugador antes de iniciar una ronda; contiene los minutos y segundos del `Timer`. Se persiste en `sessionStorage` durante la partida y se descarta al salir.
- **InvalidTimer**: excepción de dominio que se lanza cuando la configuración del `Timer` no es válida (valores negativos, fuera de rango o duración total igual a cero).
- **Lobby**: sala identificada por un `LobbyCode` donde los jugadores se reúnen antes de iniciar una `Round`. Contiene la lista de `Player`s y el estado de la partida (`waiting` | `playing`).
- **LobbyCode**: código alfanumérico único de 6 caracteres en mayúsculas (A-Z, 0-9) que identifica un `Lobby` y se comparte con otros jugadores para que se unan.
- **Player**: participante conectado a un `Lobby`. Tiene un nombre (`playerName`) y un rol asignado (`PlayerRole`).
- **PlayerRole**: rol asignado a un `Player`. Puede ser `describer` o `guesser`. Solo puede haber un `describer` por `Lobby` al mismo tiempo.
- **Describer**: `Player` con rol `describer`. Es el único que ve la `Card` activa (la `word` y las `bannedWords`) y da pistas al resto. Puede avanzar a la siguiente carta.
- **Guesser**: `Player` con rol `guesser`. No ve la `Card`. Escribe su intento en un campo de texto para intentar acertar la `word` activa.
- **Guess**: intento de un `Guesser` de acertar la `word` activa. La validación de si es correcto ocurre en el servidor; la `word` nunca se envía al cliente `Guesser`.
- **ActiveCard**: la `Card` que está en juego durante una `Round` dentro de un `Lobby`. Solo es visible para el `Describer`.
- **RoundSession**: estado de una ronda activa dentro de un `Lobby`. Contiene la `ActiveCard`, el `startAt` (Unix timestamp en ms del momento en que el servidor arrancó la ronda) y la `durationSeconds`.
