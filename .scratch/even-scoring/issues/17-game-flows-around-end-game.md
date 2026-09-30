# How does each game's existing flow change around End game?

Type: grilling
Status: resolved
Assignee: Hussein Rzikana
Blocked by:

## Question

End game now exists ("What ends a game?"), leads into the two-beat result screen and then Home ("What does the end-of-game screen show, and how does it hand back to Home?"), and a game in progress survives a reload ("What does a saved night contain, and where is it stored?"). The games still have their own loops that predate it. Per game, what changes?

- **Where the End game control lives** on each game's screens, and how the natural-finish prompt looks (Emoji deck used up, last full Outburst lap, Final Jeopardy settled).
- **Existing loops:** Act It Out and Wavelength's "Another turn", Emoji's "Reshuffle and go again", Outburst's "Add the points": do they stay, change, or become End game?
- **Jeopardy boards:** does ending a Jeopardy game reset its board (used clues, Daily Double, Final), so a replay ("Is playing the same game again a new game?") starts fresh? What about the other language's board?
- **Leaving via Home mid-game:** is the game still in progress (resumable by launching it again), or abandoned? What happens if the host launches a *different* game while one is in progress?
- **Outburst in free-for-all:** it isn't offered ("Which games count turns…?"); how does Home show that?

## Answer

**One game in progress at a time, ended from the top bar or at a natural-finish prompt; each Jeopardy board is its own game, played once a night; the result screens keep each game's character, plus confetti.** Resolved by grilling, 2026-09-28.

- **Jeopardy boards are separate games.** English and Arabic are two Jeopardy games, each with its own placement points ("Is playing the same game again a new game?"); a night can play both.
  - A board whose game has ended, at its Final or early by End game, is **"Played tonight"** in the picker and can't be started again until "New night". Leftover clues aren't kept. The "played" mark is part of Jeopardy's board progress in the saved night.
  - Once both boards are played, the Jeopardy card on Home reads "Both boards played tonight".
  - Launching Jeopardy with a board in progress goes straight into that board, skipping the picker.
- **End game** lives in the **top bar next to Home**, shown only while a game is in progress. It always confirms ("End Wavelength now?"), with the uneven-turns warning folded in when it applies ("What happens when turns are uneven at game end?").
- **Natural finishes** (Final Jeopardy settled, Emoji's last riddle, Outburst's last full lap) show a prompt card in the game's own voice ("Final Jeopardy is settled", "That's every riddle", "That's every category") with a single **End game** button and **no confirm**, straight into the result screens. Jeopardy's own "Final standings" screen and "Play the other board" are removed; beat 1 replaces them.
- **Loops by game:**
  - **Emoji:** "Reshuffle and go again" is replaced by the natural-finish prompt. Playing again is a new game from Home, freshly shuffled.
  - **Outburst:** the "ALL ROUNDS COMPLETE" card becomes the natural-finish prompt at the last full lap (8 rounds for 2 or 4 teams, 9 for 3).
  - **Act It Out:** "Add the points" (confirms the turn) and "Another turn" (do-over) stay. No natural finish.
  - **Wavelength:** unchanged, silent reshuffle included. No natural finish.
- **Only one game in progress; leaving doesn't end it.** Home (the top-bar button or a game's own) leaves the game **in progress**; its launch card reads "Resume …" and resumes at the step before whatever was mid-way (as a reload does, "What does a saved night contain, and where is it stored?"). Launching a *different* game asks "Wavelength is still in progress. End it and start Emoji?": Yes runs End game and the result screens, then starts the new game; No cancels.
- **Outburst in free-for-all:** its Home card stays visible, greyed out, with "Teams only" in place of its button.
- **Effects that must survive into the result screens** ("What does the end-of-game screen show, and how does it hand back to Home?"):
  - An **Arabic Jeopardy** game's result screens are in Arabic: `dir="rtl"`, the Cairo typeface, Arabic headings and winner line.
  - **Jeopardy's winner line** stays "… takes it" / "… في الصدارة" instead of the generic "… wins".
  - The winner's row on beat 1 has the **leader glow** (accent outline).
  - The **beat 2 slide** (hold the old order, slide into the new, +N appears as rows land) is required, not optional polish.
  - **Confetti:** one burst of a couple of seconds as beat 1 appears, in the winner's entity colour (both colours for a shared win). None when every entity ties, none on beat 2, and none when the system asks for reduced motion.

Rejected: both boards as one Jeopardy game (a game left in progress all night; the ×4 weight is for one board); replaying a played board (its clues and Daily Double are known); abandoning a game when leaving via Home (silently loses points); several games in progress at once (breaks the single "This game" row); hiding Outburst in free-for-all; a confirm on natural finishes.
