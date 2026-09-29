# 08: Jeopardy boards as separate games

Spec: [Even scoring across games](../../even-scoring/spec.md). Vocabulary: the domain glossary (`CONTEXT.md`).

**What to build:** The English and Arabic boards become separate Jeopardy games, each with its own placement points; a night can play both. A board whose game has ended (at its Final, or early by End game) is played for the night. Final Jeopardy settled is a natural finish, which replaces Jeopardy's own "Final standings" screen. The result screens keep Jeopardy's character: its own winner line, and the Arabic board's results in Arabic.

**Blocked by:** 03: End-of-game result screens; 06: One game in progress, kept when leaving; 07: Natural finishes and loop changes for Emoji and Outburst

**Status:** ready-for-agent

- [ ] Choosing a board in the picker starts a Jeopardy game for that board. Launching Jeopardy while a board is in progress goes straight into that board, skipping the picker.
- [ ] A board whose game has ended shows "Played tonight" in the picker and can't be started again until New night; leftover clues aren't kept. With both played, Jeopardy's Home card reads "Both boards played tonight" (the Night refuses a played board; tested).
- [ ] Final Jeopardy settled shows "Final Jeopardy is settled" with one End game button (no confirm). Jeopardy's own "Final standings" screen and "Play the other board" are removed.
- [ ] Jeopardy's winner line on beat 1 reads "<winner> takes it" (English) or "<winner> في الصدارة" (Arabic).
- [ ] An Arabic-board game's result screens are fully in Arabic, with `dir="rtl"`, the `.ar` class and the Cairo typeface.
- [ ] CLAUDE.md's Jeopardy rules still hold: a wrong normal clue costs nothing; Daily Double and Final wagers swing both ways; Final wagers are capped at the team's current score; the Daily Double never sits in the 100 row.
- [ ] By hand: play the Arabic board to its Final and check both result screens right to left in Cairo; a Daily Double still adds and subtracts.
