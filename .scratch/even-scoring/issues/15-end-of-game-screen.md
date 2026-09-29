# What does the end-of-game screen show, and how does it hand back to Home?

Type: prototype
Status: resolved
Assignee: Hussein Rzikana
Blocked by:

## Question

When the host ends a game ("What ends a game?"), each entity earns placement points: place points 5 / 3 / 1 plus a share of a 10-point pie, scaled by the game type's weight ("How do game scores convert into placement points?", "What are the starting weights per game type?"). What does the screen that follows show, read from across the room: the final game scores, the placement points each entity earned, the night standings moving? How does the room get from that screen back to Home, where the scoreboard row shows the ranked night standings ("How does the scoreboard show game scores and night standings together on a TV?")? It must work for 2–4 teams and for a ~12-player free-for-all.

## Answer

**Two host-paced beats: the final game scores, then the night standings sliding into their new order; then Home.** Resolved by prototype, 2026-09-28 (variant B).

- **Beat 1: final game scores.** A full screen headed by the game ("Wavelength · final scores") and the winner as the title ("Sons of the Nile wins"; a shared top score reads "… tie for the win"). Below, every entity ranked by game score, with its place number and large game score; the winner's row is highlighted. With more than 6 entities, the list splits into two columns that read down each column. No placement points on this beat.
- **The host moves on** with a "Tonight's standings →" button or Space.
- **Beat 2: night standings.** "Night standings", every entity in its *old* order with its old total. After a short pause the rows slide into the *new* order, each total updates, and each row shows the placement points it just earned ("+14"). Ranks are shown and tied totals share a place.
- **Back to Home** with a button or Space. Home shows the scoreboard row's ranked night standings as usual ("How does the scoreboard show game scores and night standings together on a TV?"); nothing extra is carried over from the result.
- **The room never sees the formula.** Place points, pie share and weight are not shown; only "+N". A finished game's game scores can still be corrected from Home ("Where and how does the host edit a game score?").
- **Same screens for 2–4 teams and a 12-player free-for-all.** Low results (+0, +1) are shown plainly like the rest.

Rejected: a single results table with the full breakdown (place, pie, earned, tonight's rank and movement) all at once (A); too many numbers to read from across a room, and it crowds "who won" and "where are we tonight" into one moment. Going straight to Home with a result banner and +N on the Tonight chips (C); fastest, but it skips the moment. Showing +N on the Home chips after beat 2 was offered and not taken.

**Prototype:** `src/endGame.prototype.ts` on branch `prototype/end-of-game-screen` (commit 4c31563). Run `npm run dev` on that branch and open `/?variant=B&data=teams4` (`data` also takes `teams2` or `ffa12`); press "Enter game" on the bottom bar, then "End game" in the scoreboard row. The "End game" button placement there is a stand-in, not a decision. A and C are still there for comparison.
