# Dominio del juego Banned Hint

## Objetivo

Un jugador (`Describer`) debe conseguir que el resto (`Guessers`) adivinen la palabra objetivo de una carta sin decir ninguna de las palabras prohibidas, dentro de un tiempo limitado.

## Modos de juego

### Modo Local

Un único dispositivo, un único jugador. El flujo es:

1. El jugador accede a la pantalla de inicio (`/`) y selecciona **Modo Local**.
2. Redirige a `/local/setup`, donde configura la duración de la ronda (`Timer`) en minutos y segundos.
3. Pulsa «¡JUGAR!» y accede a `/round`.
4. En `/round` ve la `Card` activa (palabra objetivo y palabras prohibidas), el cronómetro y los controles (Siguiente, Pausa/Continuar, Salir).
5. Cuando pulsa «Siguiente», se carga una nueva `Card` aleatoria y se reinicia el cronómetro.
6. Cuando el cronómetro llega a 0, se carga automáticamente una nueva `Card`.
7. Al pulsar «Salir» o navegar fuera, se limpia la sesión y redirige a `/local/setup`.

### Modo Sala (Multijugador)

Múltiples dispositivos conectados mediante WebSocket. El flujo es:

1. El host accede a la pantalla de inicio (`/`) y selecciona **Modo Sala**.
2. Redirige a `/lobby/new` (pantalla de creación de sala).
3. El host introduce su nombre y la duración de la ronda, luego pulsa «Crear sala».
4. El servidor genera un `LobbyCode` único, asigna al host el rol `Describer` y crea el `Lobby`.
5. El host comparte el `LobbyCode` con el resto de jugadores.
6. Los demás jugadores entran a `/lobby/<code>` introduciendo el `LobbyCode` y su nombre (rol `Guesser`).
7. El `Describer` pulsa «Iniciar ronda». Se selecciona una `Card` aleatoria y se emite un evento `round-started` con la `ActiveCard`, el `startAt` (timestamp en ms) y la `durationSeconds`.
8. Cada cliente redirige automáticamente según su rol:
   - `Describer` → `/round`: ve la `word` y las `bannedWords`.
   - `Guesser` → `/round/guess`: ve solo el cronómetro y un campo de texto.
9. Los `Guessers` escriben intentos. El servidor valida y responde con `{ correct: boolean }` solo al emisor.
10. El `Describer` pulsa «Siguiente» para cargar una nueva `Card`.
11. Cuando el cronómetro llega a 0, el servidor emite automáticamente `card-changed`.

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
