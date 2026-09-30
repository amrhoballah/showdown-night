# 07: Natural finishes and loop changes for Emoji and Outburst

Spec: [Even scoring across games](../../even-scoring/spec.md). Vocabulary: the domain glossary (`CONTEXT.md`).

**What to build:** Games with a real end now reach a **natural finish**: a prompt card in the game's own voice with a single End game button and no confirm, leading straight into the result screens. Emoji's used-up deck prompts instead of offering "Reshuffle and go again". Outburst finishes at its last full lap, so every team has had the same number of turns, and it isn't offered in free-for-all.

**Blocked by:** 03: End-of-game result screens; 05: Turns and the uneven-turns warning

**Status:** ready-for-agent

- [x] Emoji: when the last riddle is done, a card reads "That's every riddle" with one End game button (no confirm) into the result screens. "Reshuffle and go again" is removed; playing again is a new game from Home, freshly shuffled.
- [x] Outburst: the natural finish comes after the last full lap, 8 rounds for 2 or 4 teams and 9 for 3; the "ALL ROUNDS COMPLETE" card becomes "That's every category" with one End game button.
- [x] Act It Out and Wavelength keep their loops unchanged and have no natural finish.
- [x] In free-for-all, Outburst's card on Home stays visible, greyed out, with "Teams only" instead of its button; the Night refuses to start Outburst in free-for-all (tested).
