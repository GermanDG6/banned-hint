# Game Domain — Banned Hint

## Objective

One player (the `Describer`) must get the rest of the players (`Guessers`) to guess the target word on a card without saying any of the banned words, within a time limit.

## Game Modes

### Local Mode

A single device, a single player acting as Describer. The group guesses out loud — in person or over a call. The flow is:

1. The player accesses the home screen (`/`) and selects **Local Mode**.
2. Redirects to `/local/setup`, where they configure the round duration (`Timer`) in minutes and seconds.
3. Taps "PLAY!" and is taken to `/round`.
4. In `/round`, they see the active `Card` (target word and banned words), the countdown timer, and the controls (Next, Pause/Resume, Exit).
5. When they tap "Next", a new random `Card` is loaded and the timer resets.
6. When the timer reaches 0, a new `Card` is automatically loaded.
7. When they tap "Exit" or navigate away, the session is cleared and they are redirected to `/local/setup`.

### Room Mode (Multiplayer)

Multiple devices connected via WebSocket. Each player has their own screen. The flow is:

1. The host accesses the home screen (`/`) and selects **Room Mode**.
2. Redirects to `/lobby/new` (room creation screen).
3. The host enters their name and the round duration, then taps "Create Room".
4. The server generates a unique `LobbyCode`, assigns the host the `Describer` role, and creates the `Lobby`.
5. The host shares the `LobbyCode` with the other players.
6. Other players go to `/lobby/<code>`, enter the `LobbyCode` and their name (assigned the `Guesser` role).
7. The `Describer` taps "Start Round". A random `Card` is selected and a `round-started` event is emitted with the `ActiveCard`, the `startAt` (timestamp in ms), and the `durationSeconds`.
8. Each client is automatically redirected based on their role:
   - `Describer` → `/round`: sees the `word` and the `bannedWords`.
   - `Guesser` → `/round/guess`: sees only the timer and a text field.
9. `Guessers` type their attempts. The server validates and responds with `{ correct: boolean }` only to the sender.
10. The `Describer` taps "Next" to load a new `Card`.
11. When the timer reaches 0, the server automatically emits `card-changed`.

## Multiplayer Game Flow

1. The host creates a `Lobby` on the home screen, enters their player name and the round duration (`RoundConfig`).
2. The server generates a unique `LobbyCode` and assigns the host the `Describer` role.
3. The host shares the `LobbyCode` with the other players.
4. Other players enter the waiting room (`WaitingRoom`) by entering the `LobbyCode` and their name. They are assigned the `Guesser` role.
5. The `Describer` taps "Start Round". The server selects a random `Card` and emits a `round-started` event with the `ActiveCard`, the `startAt` (timestamp in ms), and the `durationSeconds`.
6. Each client is automatically redirected based on their role:
   - `Describer` → `/round` screen: sees the `word` and the `bannedWords`.
   - `Guesser` → `/round/guess` screen: sees only the timer and a text field.
7. `Guessers` type their attempts (`Guess`). The server validates each attempt and responds with `{ correct: boolean }` only to the `Guesser` who sent it.
8. If a `Guesser` guesses correctly, they see a confirmation on their screen.
9. The `Describer` taps "Next" to load a new `Card`. The server emits `card-changed` with the new `ActiveCard` and a new `startAt`.
10. When the `Timer` reaches zero (computed locally by each client from `startAt + durationSeconds`), the server automatically emits a new `card-changed`.

## Main Rules

- The round duration must be greater than zero (minutes ≥ 0, seconds ≥ 0, total > 0).
- Each `Card` must have:
  - A non-empty `word`.
  - At least 4 words in `bannedWords`.
- The `Describer` cannot use any word listed in `bannedWords`.
- Only one `Describer` is allowed per `Lobby`.
- The active `Card` (word + bannedWords) is **never** sent to a `Guesser` client. `Guess` validation happens on the server.
- The `Timer` is synchronized between clients using the `startAt` emitted by the server: each client computes the remaining time as `durationSeconds - (Date.now() - startAt) / 1000`. There is no server tick.
- Only the `Describer` can emit the `start-round` and `next-card` events. The server rejects these events if the sender has the `Guesser` role.
