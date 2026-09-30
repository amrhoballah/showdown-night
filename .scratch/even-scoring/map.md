# Even scoring across games

Label: wayfinder:map

## Destination

A buildable spec (ready for `/to-spec` → `/to-tickets`) for converting each game's **game scores** into weighted **placement points** when the game ends, so the **night standings** aren't dominated by whichever game has the biggest point scale, plus host editing of game scores and persistence of the night across reloads.

**Reached:** every ticket is resolved; the spec is [Spec: Even scoring across games](spec.md) (`ready-for-agent`).

## Notes

- Domain: party game console, one shared screen, host at the laptop. Vocabulary lives in `CONTEXT.md` (Entity, Game score, Placement points, Night standings). Keep it current.
- Tracker: local markdown. Tickets are `issues/NN-*.md`; frontier = `Status: open`, every `Blocked by` ticket resolved, first by number.
- Every session: read `CLAUDE.md` first. Its "decisions, not bugs" (Jeopardy wager asymmetry, Daily Double never in the 100 row) still govern game scores; this effort changes only how game scores reach the standings.
- Must work for both team mode (2–4 teams) and free-for-all (~12 players).
- Grilling tickets: call the grilling and domain-modeling skills. Prototype tickets: call the prototype skill.

## Decisions so far

- [What ends a game?](issues/01-what-ends-a-game.md): the host's End game action, plus a prompt at each game's natural finish.
- [Are all games worth the same?](issues/02-are-all-games-worth-the-same.md): no; a fixed weight per game type, in a tunable config.
- [What happens when turns are uneven at game end?](issues/03-what-happens-when-turns-are-uneven.md): warn the host, but allow ending.
- [Is playing the same game again a new game?](issues/04-is-a-replay-a-new-game.md): yes; each End game awards one set of placement points.
- [What does the sticky scoreboard show during a game?](issues/05-what-the-scoreboard-shows-mid-game.md): both the game scores and the night standings.
- [How does the host correct a wrong score?](issues/06-how-the-host-corrects-a-score.md): set a game score directly, even after the game ends; standings are recalculated.
- [Does the night survive a page reload?](issues/07-does-the-night-survive-a-reload.md): yes, via browser web storage.
- [How do game scores convert into placement points?](issues/08-placement-formula.md): place points 5 / 3 / 1 (ties share the better place) plus a whole-point share of a 10-point pie; a blowout is worth up to 15.
- [How are ties and negative game scores placed?](issues/09-ties-and-negative-scores.md): negatives rank normally; the pie goes to positive scores, else to entities at 0, else is split by inverse size among all-negative scores.
- [What are the starting weights per game type?](issues/10-starting-weights.md): fixed weights from expected length (Emoji 1×, Act It Out 1.5×, Wavelength 1.5×, Outburst 2×, Jeopardy 4×) in an editable config, scaling the whole placement points, rounded to whole numbers.
- [Which games count turns, and what triggers the uneven-turns warning?](issues/11-turn-counting.md): Wavelength, Act It Out and Outburst (one team per round); a turn is a host-confirmed round; any imbalance warns; the fewest-turns entity is preselected; Outburst finishes at the last full lap and isn't offered in free-for-all.
- [How does the scoreboard show game scores and night standings together on a TV?](issues/12-scoreboard-layout.md): one row; in a game it shows game scores and switches to the ranked standings only while the host holds "This game"; on Home it shows the standings.
- [Where and how does the host edit a game score?](issues/13-edit-surface.md): double-click a game-score chip to type over it (Enter saves, Esc cancels); finished games are corrected from Home by double-clicking a Tonight chip; negatives only in Jeopardy; the game in progress counts nothing until it ends.
- [What does a saved night contain, and where is it stored?](issues/14-saved-night.md): one saved night in localStorage, saved after every change (night, game in progress, Jeopardy board progress; never mid-step state); a "Continue tonight?" prompt on load; "New night" on Home with a confirm.
- [What does the end-of-game screen show, and how does it hand back to Home?](issues/15-end-of-game-screen.md): two host-paced beats (final game scores with the winner, then the night standings sliding into the new order with +N each), then Home; the formula isn't shown.
- [Once a night has a finished game, what may the host change in the setup?](issues/16-changing-setup-mid-night.md): rename any time; mode and team count locked until New night; entities join at 0 or are marked Left (results kept, can come Back), only between games; never below 2, else offer to end the night.
- [How does each game's existing flow change around End game?](issues/17-game-flows-around-end-game.md): one game in progress, kept when leaving via Home; End game in the top bar with a confirm, or a one-button prompt at natural finishes; each Jeopardy board is its own game, played once a night; result screens keep Arabic, Jeopardy's winner line, the glow and slide, plus confetti.

## Not yet specified

Nothing left in the fog: every remaining question is a live ticket.

## Out of scope

- **Mafia in the night standings**: Mafia keeps its own player list and win condition, and matching Mafia players to scoreboard entities is its own problem (see `CLAUDE.md`).
- **Per-award history and undo**: ruled out in favour of setting game scores directly ([How does the host correct a wrong score?](issues/06-how-the-host-corrects-a-score.md)).
- **A "night over" screen crowning the night's winner**: a feature of its own beyond converting game scores into standings; ending a night stays "New night" ([Once a night has a finished game, what may the host change in the setup?](issues/16-changing-setup-mid-night.md)).
