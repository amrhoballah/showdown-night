# How do game scores convert into placement points?

Type: prototype
Status: resolved
Blocked by:

## Question

When a game ends, how does each entity's game score become placement points? Candidates:

- **Rank only**: fixed points by position (F1-style); winning by 1 and by 1,000 are the same.
- **Proportional**: a share of a fixed pot, e.g. `10 × score / top score`.
- **Hybrid**: rank points plus a small margin bonus.

Prototype by running a few realistic nights (mixed Jeopardy, Emoji, Wavelength, Act It Out, Outburst game scores, 2–4 teams and free-for-all with ~12 players) through each formula and reacting to the resulting standings. Must hold for free-for-all's larger entity count, not just 2–4 teams.

## Answer

**Place points + a share of the pie.** When a game ends, each entity's placement points are the sum of:

- **Place points:** 1st = 5, 2nd = 3, 3rd = 1, 4th and below = 0. Tied entities share the better place (two teams tied for 2nd both get 3; the next team is 4th).
- **Pie share:** a 10-point pie split by share of the game's total: `round(10 × game score ÷ sum of all game scores)`, rounded per entity to a whole point. If the total is 0, nobody gets pie points.

Worked examples: shares 50 / 30 / 10 / 10 → 10 / 6 / 2 / 2. A total blowout (one team scores everything) → 15 / 3 / 3 / 3, because the scoreless teams tie for 2nd. A game where nobody scored → everyone ties for 1st and gets 5, which leaves the relative standings unchanged. That was accepted deliberately.

Why: rank alone ignored the margin; a pure proportional split let one lopsided game dominate. Place points fix the order, and the pie rewards the size of the win. A higher game score always earns at least as much in both parts, so places can never flip.

Also settled here:
- One pie size for every entity count. A 2-team winner always gets ≥ 10; a 12-player free-for-all winner may get about 7. Fine, because points are only ever compared within one night.
- Negative game scores count as 0 in the pie *for now*; the actual rule is left to "How are ties and negative game scores placed?".

Rejected alternatives: raw sum (today), rank-only even steps, rank-only winner-heavy 10/7/5/4/3/2/1, proportional-only, a min–max margin hybrid (it collapses with 2 teams), and a winner-only blowout bonus.

**Prototype:** `src/placement.prototype.html` on branch `prototype/placement-formula` (commit 28db40b). It's a pure `Placement` module plus guided nights; the `pie` formula is the one to lift.
