# 04: Score corrections

Spec: [Even scoring across games](../../even-scoring/spec.md). Vocabulary: the domain glossary (`CONTEXT.md`).

**What to build:** The host sets a game score directly. During a game: double-click a game-score chip in the scoreboard row, type, Enter saves, Esc or clicking away cancels. After a game: on Home, double-click an entity's chip in the Tonight row to open that entity's finished games tonight, each with its game score editable and the placement points it earned. Correcting a finished game recalculates its placement points and the night standings immediately; correcting the game in progress changes only its game scores.

**Blocked by:** 02: Tracer bullet: a game in progress, End game, and derived night standings

**Status:** ready-for-agent

- [ ] Double-clicking a game-score chip during a game turns its number into a preselected input; Enter saves, Esc or blur cancels; a single click does nothing; holding the "This game" label is unaffected.
- [ ] On Home, double-clicking a Tonight chip opens a panel under the row listing that entity's finished games (game type, editable game score, placement points earned); Enter saves; the panel closes with its × or Esc.
- [ ] Correcting a finished game re-ranks it (place points and pie) and updates the night standings at once. Correcting the game in progress leaves the standings unchanged until it ends.
- [ ] Only whole numbers are accepted. Negative game scores are accepted only in Jeopardy; elsewhere an on-screen message reads e.g. "Emoji scores can't go below 0" and nothing changes.
- [ ] Corrections never change turn counts.
- [ ] Tests cover correcting finished games and the game in progress, the negatives and whole-number rules, through the Night's operations.
