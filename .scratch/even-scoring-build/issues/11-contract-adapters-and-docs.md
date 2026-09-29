# 11: Contract: remove the adapters and update CLAUDE.md

Spec: [Even scoring across games](../../even-scoring/spec.md). Vocabulary: the domain glossary (`CONTEXT.md`).

**What to build:** Once every caller reads and writes through the Night, the positional `award()` and `entities()` adapters from the prefactor are deleted, and CLAUDE.md is brought up to date, so the next session isn't told the scoreboard is a single running total.

**Blocked by:** 04: Score corrections; 07: Natural finishes and loop changes for Emoji and Outburst; 08: Jeopardy boards as separate games; 10: Changing the setup mid-night

**Status:** ready-for-agent

- [ ] No caller of the positional adapters remains; they are removed, and `npm run build` and `npm test` pass.
- [ ] CLAUDE.md's architecture and conventions describe the Night module as the owner of shared state (entities, games, standings, the saved night), replacing the notes on the scoreboard as shared state and `award()` as the running total.
- [ ] CLAUDE.md's "Testing" section mentions `npm test` alongside the by-hand checks.
- [ ] CLAUDE.md keeps its existing decisions (Mafia outside the standings, Jeopardy's wager rules, the Arabic board's rules) and adds the new ones worth protecting: weights by expected length, placement over raw points, one game in progress, Jeopardy boards played once a night.
