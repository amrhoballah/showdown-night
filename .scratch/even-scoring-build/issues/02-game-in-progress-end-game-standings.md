# 02: Tracer bullet: a game in progress, End game, and derived night standings

Spec: [Even scoring across games](../../even-scoring/spec.md). Vocabulary: the domain glossary (`CONTEXT.md`).

**What to build:** Launching any scoring game starts a **game in progress** of that type, and awards go into its **game scores**. The host ends it with **End game** in the top bar (confirmed). Ending converts each entity's game score into **placement points** (place points 5 / 3 / 1 plus a pie share of 10, times the game type's **weight**, rounded), and the **night standings** are always computed from the finished games. The scoreboard row shows this game's scores during a game ("This game"), switches to the ranked standings while the host holds that label, and shows the ranked standings on Home. For now, ending returns straight to Home.

After this ticket, the core problem is solved end to end: a Jeopardy board no longer outweighs everything else by point scale.

**Blocked by:** 01: Prefactor: the Night module behind the existing scoreboard

**Status:** ready-for-agent

- [ ] Launching Jeopardy, Outburst, Act It Out, Emoji or Wavelength starts a game in progress of that type; `award()` adds to that game's game scores. Mafia is untouched.
- [ ] A weights config maps game type to weight: Emoji 1, Act It Out 1.5, Wavelength 1.5, Outburst 2, Jeopardy 4 (one weight for both boards).
- [ ] The placement formula matches the spec's decided rules and prototype snippet: shared better place on ties; negatives rank normally; the pie goes to positive scores, else split among the 0s, else by inverse size when every score is negative; no pie when everyone is at 0; weight applied to place points plus pie; rounded to the nearest whole number with halves up.
- [ ] Night standings are always derived from the finished games' game scores, never stored; the game in progress contributes nothing until it ends.
- [ ] Replaying a game type is a new game with its own placement points.
- [ ] End game appears in the top bar next to Home only while a game is in progress, and always asks to confirm ("End Wavelength now?"). Confirming stops the game's timers, ends it and returns to Home.
- [ ] The scoreboard row during a game shows game scores under a "This game" label; pressing and holding the label shows the ranked night standings under "Tonight" and snaps back on release (including release outside the button, or cancel). On Home it shows the ranked standings under a static "Tonight". With 12 players it wraps onto several lines.
- [ ] Tests (through the Night's public operations) cover every worked case in the spec's formula section, weights and rounding, standings unaffected by the game in progress, and replays as new games.
- [ ] By hand: play two games of different types with 2 teams, end each, and check the Home standings.
