# Where and how does the host edit a game score?

Type: prototype
Status: resolved
Assignee: Hussein Rzikana
Blocked by: 12

<!-- The scoreboard is a single row whose "This game" label is a hold-to-peek control (see "How does the scoreboard show game scores and night standings together on a TV?"). An edit gesture on the row must not collide with that hold. -->

## Question

The host sets a game score directly, during a game or after it has ended ("How does the host correct a wrong score?"). Where does that happen (tapping a game-score chip in the scoreboard row, an edit mode, a dedicated screen), and how does the host reach a finished game's scores to correct them? It must be usable by a host at a laptop in a noisy room, without being triggered by accident. Can it enter a negative game score in games that can't produce one (anything but Jeopardy)? Placement handles negatives in any game ("How are ties and negative game scores placed?").

## Answer

**Double-click a chip in the scoreboard row and type over it.** Resolved by prototype, 2026-09-28 (variant A).

- **During a game:** double-clicking a game-score chip turns its number into an input, preselected. **Enter** saves; **Esc** or clicking away cancels. A single click does nothing, so a stray click can't open it. The "This game" hold-to-peek label is a separate control, so the two gestures don't collide.
- **Finished games, from Home:** double-clicking a chip in the Tonight row opens a panel under the bar listing that entity's finished games tonight, each with its game score as an input (Enter saves) and the placement points it earned. Finished games are reachable **only from Home**, not from inside a game.
- **The game in progress never counts toward the night standings** until the host ends it, correction or not. That keeps "What ends a game?": correcting a live score changes only the game score; once the game has ended, correcting it recalculates its placement points (place points and pie) and the night standings immediately. Checked on the prototype: Jeopardy 800 / 900 ended gives 32 / 40; correcting the finished game to 1400 / 900 re-ranks it to 44 / 28.
- **Negatives only in Jeopardy.** A negative game score is rejected in every other game type with an on-screen message ("Emoji scores can't go below 0"). Only whole numbers are accepted.
- The editor happens on the TV in front of the room; there is no hidden editing surface.

Rejected: an explicit edit-mode panel with game tabs, −/+ steppers and Save/Cancel (B), and a full-screen ledger of every game tonight (C). Variant A had the least new UI on screen.

**Prototype:** `src/scoreEdit.prototype.ts` on branch `prototype/edit-surface` (commit 91f4ac7). Run `npm run dev` on that branch and open `/?variant=A&data=teams2` (`data` also takes `teams4` or `ffa12`; `neg=any` allows negatives everywhere). Its "End game" button is a stand-in, not a design for the real one. B and C are still there for comparison.
