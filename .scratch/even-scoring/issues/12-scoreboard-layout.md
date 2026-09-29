# How does the scoreboard show game scores and night standings together on a TV?

Type: prototype
Status: resolved
Assignee: Hussein Rzikana
Blocked by:

## Question

The sticky scoreboard shows both the current game scores and the night standings during a game ("What does the sticky scoreboard show during a game?"). What layout keeps both readable from across a room, for 2–4 teams and for a ~12-player free-for-all? What does it show on the home screen, between games?

## Answer

**One row that shows one view at a time; the host holds "This game" to peek at tonight.** Resolved by prototype, 2026-09-28 (variant D, modified).

- **During a game:** the row shows the **game scores** in entity order, headed by a **"This game"** label. The label is a control: **while the host holds it down**, the row switches to the **night standings**, ranked with place numbers and headed "Tonight"; **on release** it goes back to the game scores. It is a hold, not a toggle, so the row can't be left on the wrong view.
- **On Home, between games:** the row shows only the night standings, ranked, with a static "Tonight" label. No game scores and no hold.
- **Same layout for 2–4 teams and free-for-all.** With 12 players the row wraps onto several lines. That was accepted over a side rail, which would take width from every game screen.
- **Nothing switches on a timer.** An automatic flip between the two views was prototyped and rejected, because the number people want would be hidden half the time.

Rejected: both numbers on each chip (A), a second standings ribbon under the bar (B), and a fixed standings rail on the right (C). All of them either stack up to four rows with 12 players or permanently take space from the game.

Noticed along the way, and not decided here: free-for-all has only four entity colours, so with 12 players the colours repeat (this is already true today).

**Prototype:** `src/scoreboard.prototype.ts` on branch `prototype/scoreboard-layout` (commit 136f2ea). Run `npm run dev` on that branch and open `/?variant=D&data=ffa12` (`data` also takes `teams2` or `teams4`). Variants A–C are still there for comparison.
