# 09: Saved night, Continue, and New night

Spec: [Even scoring across games](../../even-scoring/spec.md). Vocabulary: the domain glossary (`CONTEXT.md`).

**What to build:** The whole **night** survives a reload, closed tab, browser crash or restart. It is saved to localStorage after every change. On load, a full-screen "Continue tonight?" card offers it back when it has a finished game or a game in progress. The host starts over with "New night" on Home, which asks to confirm.

**Blocked by:** 06: One game in progress, kept when leaving; 08: Jeopardy boards as separate games

**Status:** ready-for-agent

- [ ] One saved night in localStorage, overwritten after every change (each award, each clue used, each setup edit). It holds the mode, the entities, the finished games in play order (type, board, game scores), the game in progress (type, board, game scores, turn counts), and Jeopardy board progress per board (used clues, Daily Double position, Final done, played).
- [ ] It never holds mid-step state or Emoji / Wavelength / Act It Out / Outburst deck positions; those reshuffle on resume. Mafia isn't saved.
- [ ] The format carries a version; an unreadable or unknown-version saved night falls back to a fresh night without breaking the load.
- [ ] On load with a finished game or game in progress: a full-screen "Continue tonight?" card shows the entities, the number of finished games, the game in progress and the standings. Continue returns to the game in progress (at the step before any mid-step state) or to Home; "Start a new night" goes through the New night confirm.
- [ ] A saved night with only a setup is restored silently onto Home, with no card.
- [ ] Home has a "New night" button next to the setup (not reachable inside a game), confirming "This clears tonight's standings and every finished game. Start a new night?"; yes clears everything.
- [ ] Tests: serialize → deserialize round-trips every night shape (finished games, game in progress, turn counts, Jeopardy progress), and bad input falls back to a fresh night.
- [ ] By hand: reload mid-Jeopardy, Continue, and check the used clues and the Daily Double are kept.
