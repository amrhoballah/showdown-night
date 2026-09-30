# 05: Turns and the uneven-turns warning

Spec: [Even scoring across games](../../even-scoring/spec.md). Vocabulary: the domain glossary (`CONTEXT.md`).

**What to build:** Wavelength, Act It Out and Outburst count **turns**: a turn is a round whose result the host confirms, including a 0-point result. Each game preselects the entity with the fewest turns for the next round (ties go to the next in order), and the host can override. Ending one of these games with uneven turns warns in the End game confirm and names who is short, but still allows ending. Outburst becomes one team per round: the team whose turn it is shouts and is credited.

**Blocked by:** 02: Tracer bullet: a game in progress, End game, and derived night standings

**Status:** ready-for-agent

- [x] A confirmed round records a turn for its entity in Wavelength, Act It Out and Outburst, including 0-point results; Act It Out's "Another turn" (do-over) records nothing. Emoji and Jeopardy have no turns; a Daily Double is not a turn.
- [x] The next round preselects the entity with the fewest turns (ties to the next in order); the host can pick another.
- [x] End game's confirm, when not every entity has the same number of turns, names who is short, e.g. "El Captains: 2 turns, the others: 3. End anyway?" The host can still end.
- [x] Outburst narrates "your team calls out" (not "everyone else"), and credits the team whose turn it is.
- [x] The same rules apply per player in free-for-all.
- [x] Tests cover turn counting, the do-over, preselection and uneven detection, in teams and free-for-all.
