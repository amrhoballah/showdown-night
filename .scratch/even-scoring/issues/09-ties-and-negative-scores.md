# How are ties and negative game scores placed?

<!-- Ties were settled by "How do game scores convert into placement points?" (tied entities share the better place). Only negatives remain. -->

Type: grilling
Status: resolved
Assignee: Hussein Rzikana
Blocked by: 08

## Question

Ties are settled: tied entities share the better place (see "How do game scores convert into placement points?"). What remains is **negative game scores**, which are possible in Jeopardy through Daily Double and Final Jeopardy wagers.

- **Place points:** does a negative score rank normally (−600 places below 0), or does every score ≤ 0 tie?
- **Pie share:** the sum of all game scores can include negatives, or be negative overall. The prototype currently counts negatives as 0 in the pie. Keep that, or subtract negatives from the total, or something else?

Test cases: 1200 / −600 / 0 and 300 / −800 / −200 (the pie total is negative).

## Answer

**Negatives rank normally; the pie depends on whether anyone scored above 0.** Resolved by grilling, 2026-09-28.

- **Place points:** negative game scores rank like any others (0 above −200 above −600). Ties still share the better place.
- **Pie share, someone scored above 0:** only positive game scores share the pie, by `round(10 × score ÷ sum of positive scores)`. Zero and negative scores get no pie.
- **Pie share, nobody above 0 but someone at 0:** the entities at 0 split the pie equally. Negative scores get no pie.
- **Pie share, every score below 0:** the pie is split by the inverse of each score's size (share ∝ 1 ÷ |score|), so being half as far below 0 earns twice the pie. Each share is rounded to a whole point.
- **Every score exactly 0:** unchanged from "How do game scores convert into placement points?": everyone ties for 1st, no pie.
- **Every game type:** the rule applies to any game score, not just Jeopardy. Whether the score editor accepts a negative score in games that can't produce one is for "Where and how does the host edit a game score?" to decide.

Worked cases:

| Game scores | Place points | Pie | Placement points |
|---|---|---|---|
| 1200 / −600 / 0 | 5 / 1 / 3 | 10 / 0 / 0 | 15 / 1 / 3 |
| 300 / −800 / −200 | 5 / 1 / 3 | 10 / 0 / 0 | 15 / 1 / 3 |
| −200 / −400 | 5 / 3 | 7 / 3 | 12 / 6 |
| −100 / −200 / −400 | 5 / 3 / 1 | 6 / 3 / 1 | 11 / 6 / 2 |
| 0 / −200 / −400 | 5 / 3 / 1 | 10 / 0 / 0 | 15 / 3 / 1 |
| −10 / −1000 | 5 / 3 | 10 / 0 | 15 / 3 |

Why: a wager that loses must cost something, so negatives rank below 0 rather than tying with it. Each case keeps the invariant from "How do game scores convert into placement points?", that a higher game score never earns less. Zeros take the pie when nobody is positive, so 0 always beats −1. An all-negative game still awards a full pie to the least-bad entity, because placement points are only ever compared within one night.

Rejected: tying every score ≤ 0; subtracting negatives from the pie total (a negative total gives a positive score a negative share); shifting scores so the lowest is 0 (the rejected min–max hybrid, which collapses with 2 teams); no pie whenever anyone sits at 0 (−1 would beat 0).
