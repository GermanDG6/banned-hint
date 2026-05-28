# Ubiquitous Language

- **Card**: a card with the target word (`word`) and a list of banned words (`bannedWords`).
- **CardId**: unique identifier for a `Card`, represented as a UUID.
- **Word**: the word the team must guess based on the clues given by the `Describer`.
- **Banned word**: a word the `Describer` cannot say when giving clues.
- **Round**: the time interval during which a `Card` is in play with an active countdown.
- **Timer**: the time limit for a `Round`, expressed in minutes and seconds. In Room mode, the server emits a `startAt` (Unix timestamp in ms) and a `durationSeconds`; each client computes the remaining time as `durationSeconds - (Date.now() - startAt) / 1000`.
- **RoundConfig**: the configuration chosen by the player before starting a round; contains the minutes and seconds of the `Timer`. It is persisted in `sessionStorage` during the game and discarded when the player exits.
- **InvalidTimer**: a domain exception thrown when the `Timer` configuration is invalid (negative values, out of range, or total duration equal to zero).
- **Lobby**: a room identified by a `LobbyCode` where players gather before starting a `Round`. Contains the list of `Player`s and the game state (`waiting` | `playing`).
- **LobbyCode**: a unique 6-character alphanumeric code in uppercase (A–Z, 0–9) that identifies a `Lobby` and is shared with other players so they can join.
- **Player**: a participant connected to a `Lobby`. Has a name (`playerName`) and an assigned role (`PlayerRole`).
- **PlayerRole**: the role assigned to a `Player`. Can be `describer` or `guesser`. Only one `describer` is allowed per `Lobby` at the same time.
- **Describer**: a `Player` with the `describer` role. The only player who sees the active `Card` (the `word` and the `bannedWords`) and gives clues to the rest. Can advance to the next card.
- **Guesser**: a `Player` with the `guesser` role. Does not see the `Card`. Types their attempt in a text field to try to guess the active `word`.
- **Guess**: an attempt by a `Guesser` to guess the active `word`. Validation of whether it is correct happens on the server; the `word` is never sent to the `Guesser` client.
- **ActiveCard**: the `Card` in play during a `Round` within a `Lobby`. Only visible to the `Describer`.
- **RoundSession**: the state of an active round within a `Lobby`. Contains the `ActiveCard`, the `startAt` (Unix timestamp in ms at the moment the server started the round), and the `durationSeconds`.
- **WordGuessed**: a WebSocket event emitted by the server to all participants in a room when a `Guesser` correctly guesses the active `word`. Contains the `playerName` of the guesser and the `word` that was guessed. Emission of this event triggers an automatic `round-ended` event.
