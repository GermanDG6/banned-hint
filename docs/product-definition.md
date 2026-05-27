# Banned Hint — Product Definition

## 1. Product vision

Banned Hint is a digital companion for the classic banned-words game. It supports two ways to play: with a single device passed to the Describer while the group plays in person or on a call, or with every player on their own device. In both cases, the app ensures that each person sees exactly the information their role requires — no more, no less.

---

## 2. Target users

### Describer
**Who they are:** The player who runs the app and gives verbal clues. In Local mode, they hold the only device in the group. In Room mode, they are the one who sets up the room and invites others.

**What they want:** To see the target word and banned words clearly on their screen, control the pace of the Round, and focus on giving clues — not on managing the app.

---

### Guesser
**Who they are:** The other players in a Room mode game. Each Guesser has their own device and types their answers during the Round.

**What they want:** To follow along with the Timer, submit guesses quickly, and know immediately whether they got it right.

---

## 3. Value proposition

### For the Describer
The app gives the Describer a clean, focused view of the current Card — target word, banned words, and Timer — on their own screen. They control when the Round starts and when to move to the next Card. In Room mode, each Guesser also has their own device, so the Describer never needs to worry about who can see what.

### For the Guesser
In Room mode, every Guesser has their own screen showing the Timer in sync with the rest of the group. They type their guesses directly into the app and receive an instant answer — no waiting for the Describer to confirm, no disputes about whether a guess was close enough. The target word never appears on their screen at any point.

---

## 4. Key capabilities (what the user can do)

**As a Describer in Local mode:**
- Set the Round duration (in minutes and seconds) before play begins.
- See the target word and banned words for the active Card.
- Advance to the next Card manually at any time.
- Pause and resume the game.
- Exit and return to the setup screen.
- Let the Timer advance automatically to the next Card when it reaches zero.

**As a Describer in Room mode:**
- Create a game room and receive a unique 6-character room code to share with others.
- Set the Round duration before the game starts.
- Start the Round when the group is ready.
- See the target word and banned words on their own device.
- Advance to the next Card manually at any time.
- Let the Timer advance automatically to the next Card when it reaches zero.

**As a Guesser in Room mode:**
- Join an existing room from their own device using a 6-character room code.
- See the Timer counting down, synchronized with all other players.
- Type guesses freely during the Round and receive immediate confirmation of whether they are correct.
- Automatically rejoin the active game if their connection drops and they reopen the app.

---

## 5. Usage scenarios

### Scenario A: Local mode — a group in the same room or on a call

A group of friends settles in for a game night. One of them opens Banned Hint on their phone, selects Local mode, and sets the Round to two minutes. That person becomes the Describer and holds the phone throughout the game. The screen shows the target word and the banned words. The group guesses out loud — shouting answers across the table or through a video call — while the Describer gives clues and taps to move to the next Card when ready. When the Timer runs out, a new Card loads automatically and the game continues.

### Scenario B: Room mode — each player on their own device

The same group of friends wants to play but this time each person has their own phone. The host opens Banned Hint, creates a room, sets the duration, and reads the 6-character room code aloud. The others enter the code on their own devices and join the room. The host's screen shows the target word and banned words; everyone else's screen shows the Timer and a text field for typing guesses. The host gives clues verbally, the others type their attempts, and the system confirms each guess instantly. When time runs out, a new Card appears for everyone at the same moment.

---

## 6. Out of scope

The following are **not part of the current version** of Banned Hint:

- **No scoring or point tracking.** The game does not count correct guesses, award points, or keep a scoreboard.
- **No player accounts or login.** Players are not required to register or sign in. There is no user profile or history.
- **No in-app communication between players.** All conversation happens outside the app — in person, by call, or by video.
- **No role switching mid-game.** The Describer remains the same throughout a Room mode game. Roles do not rotate automatically.
- **No custom Card creation.** Players cannot add their own words or banned words. Cards come from a pre-loaded set.
- **No game history or statistics.** Past games are not recorded or accessible after a session ends.
- **No monetization features.** There are no subscriptions, purchases, or ads. This is a learning project, not a commercial product.

---

## 7. Value indicators

The following signals suggest that Banned Hint is delivering value to its users:

- **Rounds complete without interruption.** The Describer runs through multiple Cards in a session without stopping to manage the app or resolve role confusion.
- **Groups successfully connect in Room mode.** Players join the same room from their own devices and start a Round without coordination failures.
- **Guessers receive instant, unambiguous feedback.** No Round is slowed down by debates over whether an answer was correct.
- **Players reconnect seamlessly after a connection drop.** When someone loses their connection mid-game in Room mode, they return to the active Round without the group having to restart.
- **Repeat usage.** Groups come back to play again after their first session.

---

## 8. Key assumptions

The product is built on the following bets about user behavior and game dynamics:

- **Verbal guessing is natural for co-located groups.** In Local mode, guessing out loud is how the game is already played — the app does not change that dynamic, it just gives the Describer a cleaner screen.
- **Each player having their own device improves Room mode.** The hypothesis is that removing any shared-screen coordination makes the multi-device experience noticeably smoother.
- **A 6-character code is easy enough to share verbally.** Players can read it aloud or type it from memory without needing a link or QR code.
- **Automatic answer verification improves trust and flow.** Removing the need for the Describer to judge whether a guess is "close enough" keeps the game moving and avoids arguments.
- **The Timer creates excitement.** The countdown adds pressure that makes the game more engaging, not more stressful.

---

## 9. Limitations and considerations

- **Learning project scope.** Banned Hint is built as a learning exercise, not as a commercial product. It is not optimized for large numbers of simultaneous users or high-traffic scenarios.
- **One Describer per room.** Each room has exactly one Describer. There is no mechanism to hand off the describing role to another player during a game.
- **Pre-loaded Card set.** The Cards available in the game come from a fixed set. Players cannot add, edit, or remove Cards.
- **Internet required for Room mode.** Multi-player mode requires a working internet connection on all devices.
- **No persistent game state.** Once a session ends — either by exiting or losing connection permanently — the game state is not saved. Players cannot resume a previous session.
