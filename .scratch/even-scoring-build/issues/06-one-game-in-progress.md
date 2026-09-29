# 06: One game in progress, kept when leaving

Spec: [Even scoring across games](../../even-scoring/spec.md). Vocabulary: the domain glossary (`CONTEXT.md`).

**What to build:** Leaving a game via Home (the top-bar button or the game's own) no longer loses it: the game stays **in progress**, and its launch card on Home reads "Resume …". Resuming returns to the step before whatever was mid-way (the board, the hand-off, "Start"), so a secret is never shown again and a timer is never cheated. There is only ever one game in progress: launching a different game asks whether to end the current one.

**Blocked by:** 02: Tracer bullet: a game in progress, End game, and derived night standings; 03: End-of-game result screens

**Status:** ready-for-agent

- [x] Home leaves the game in progress; every timer the game started is stopped.
- [x] The in-progress game's launch card on Home reads "Resume <game>"; launching it resumes at the step before any mid-step state (an open clue, a placed wager, a revealed Wavelength target, a running timer).
- [x] Launching a different scoring game while one is in progress asks "<game> is still in progress. End it and start <other>?". Yes runs End game and both result screens, then starts the other game; No cancels.
- [x] The Night refuses to start a second game while one is in progress (tested).
- [x] By hand: leave mid-Wavelength after the target is revealed, resume, and check the target isn't shown again.
