# Spec: Even scoring across games

Label: ready-for-agent
Map: [Even scoring across games](map.md) (every decision below links back to the ticket that holds it)

## Problem Statement

Showdown Night is played on one laptop plugged into a TV, with a host at the keyboard and up to twelve people in the room, split into 2–4 teams or playing free-for-all. The night is a series of games, and today every game pours its raw points into one running total.

That total is dominated by whichever game has the biggest numbers. One Jeopardy board hands out hundreds or thousands of points; a whole Emoji run hands out single digits. Win every Emoji riddle, every Wavelength round and every Act It Out turn, lose one Jeopardy board, and you lose the night. The room notices, and the smaller games stop mattering.

Around that, the night is fragile:

- Nothing ends a game. Act It Out and Wavelength loop forever, Emoji reshuffles, Outburst stops after its last category, and a Jeopardy board keeps its progress when you leave. Nobody can say when one game's result is final.
- A mistaken award can't be fixed except by awarding negative points by hand.
- A reload, closed tab or browser crash loses every score.
- Changing the teams or player list, or switching mode, silently wipes every score.

## Solution

Each game's own points (its **game score**) stay inside that game. When the host ends a game, each **entity** (a team, or a player in free-for-all) earns **placement points**: **place points** for its finishing position plus a **pie share** of a fixed 10-point pie for its margin, multiplied by the game type's **weight** (how long that game type takes). The **night standings** are the sum of placement points across every finished game tonight, so a narrow Jeopardy win and a narrow Emoji win count for their length, not their point scale.

Around that:

- A game ends when the host presses **End game** (always available, confirmed) or accepts a **natural finish** prompt. Ending shows two host-paced result screens (final game scores, then the night standings sliding into their new order) and returns to Home.
- The sticky scoreboard shows the game scores during a game, and the night standings while the host holds its "This game" label, or on Home.
- The host corrects a mistake by setting a game score directly, during a game or after it ends; the standings are recalculated from game scores.
- The whole **night** is saved after every change and offered back ("Continue tonight?") after a reload or crash. A fresh night is an explicit "New night".
- Mid-night setup changes are safe: renaming any time, latecomers join at 0, a player who goes home is marked **Left** and keeps their past results, and the mode is locked until "New night".

## User Stories

### Placement points and the night standings

1. As a player, I want a narrow win in a short game and a narrow win in a long game to count by how long each game took, not by how big its point scale is, so that every game in the night matters.
2. As a player, I want finishing 1st, 2nd or 3rd in a game to earn 5, 3 or 1 place points, so that winning a game always matters, however close it was.
3. As a player, I want a bigger margin of victory to earn more, through a share of a 10-point pie, so that a blowout counts for more than a squeaker.
4. As a player, I want a higher game score never to earn fewer placement points than a lower one, so that the conversion is never unfair.
5. As a player tied with another entity, I want us both to get the better place, so that a tie doesn't cost anyone.
6. As a player in a game where nobody scored, I want everyone to tie for 1st with no pie, so that an empty game leaves the standings order unchanged.
7. As a Jeopardy team that lost a wager, I want my negative game score to rank below teams at 0, so that a lost wager still costs something.
8. As a Jeopardy team at 0 when everyone else is negative, I want the whole pie, so that 0 always beats −1.
9. As a Jeopardy team in a game where every score is negative, I want the pie split by how close each score is to 0, so that being less far below 0 still earns more.
10. As a player, I want a Jeopardy board to be worth 4×, Outburst 2×, Act It Out and Wavelength 1.5×, and Emoji 1×, so that longer games carry more of the night.
11. As a player, I want placement points to be whole numbers, so that the standings are readable from across the room.
12. As a player in a 12-player free-for-all, I want the same formula as in team mode, so that the rules don't change with the number of players.
13. As the host, I want the weights kept in one easy-to-edit config, so that I can retune the night without touching the scoring rules.
14. As a player, I want a replayed game type (a second Emoji run, the second Jeopardy board) to be a new game with its own placement points, so that playing more of a game counts for more.

### Ending a game

15. As the host, I want an End game button in the top bar next to Home during every game, so that I always know where to end a game.
16. As the host, I want End game to ask me to confirm, so that a stray click can't end a game that can't be un-ended.
17. As the host of a turn-based game (Wavelength, Act It Out, Outburst), I want the confirm to warn me when turns are uneven and name who is short, e.g. "El Captains: 2 turns, the others: 3. End anyway?", so that I can give the short team their turn first, or end anyway.
18. As the host, I want a turn to count only once I confirm its result, including a 0-point result, so that the turn counts match what the room saw.
19. As the host of Act It Out, I want "Another turn" to be a do-over that isn't counted as a turn, so that a botched turn can be replayed fairly.
20. As the host, I want each turn-based game to preselect the entity with the fewest turns (ties go to the next in order), with the option to override, so that turns stay even without my bookkeeping.
21. As the host, I want Outburst to be one team per round, where the team whose turn it is shouts and is credited, so that turns in Outburst are real turns.
22. As the host, I want a prompt card in the game's own voice at a natural finish ("Final Jeopardy is settled", "That's every riddle", "That's every category") with a single End game button and no confirm, so that ending when there's nothing left to play is one click.
23. As the host of Outburst, I want the natural finish at the last full lap (8 rounds for 2 or 4 teams, 9 for 3), so that every team has had the same number of turns.
24. As the host of Emoji, I want the used-up deck to prompt End game instead of "Reshuffle and go again", so that one deck is one game.
25. As the host of Act It Out or Wavelength, I want their loops unchanged ("Add the points" and "Another turn"; Wavelength's silent reshuffle), so that endless games end only when I end them.

### The end-of-game screens

26. As a player, I want the first screen after a game to show the final game scores, ranked, with the winner as the title and their row glowing, so that the room celebrates who won this game first.
27. As a player, I want confetti in the winner's colour (both colours for a shared win) as that first screen appears, so that winning feels like a moment.
28. As a player, I want no confetti when every entity ties, so that confetti always means someone won.
29. As a viewer who is sensitive to motion, I want the confetti and the slide skipped when my system asks for reduced motion, so that the screen stays comfortable.
30. As the host, I want to move to the next screen with a button or Space, so that I can let the cheering finish first.
31. As a player, I want the second screen to show tonight's standings in their old order, then slide them into the new order with each entity's "+N", so that the room sees how the game moved the night.
32. As a player, I want only "+N" shown, not place points, pie and weight, so that the screen stays readable from the sofa.
33. As a player in a 12-player free-for-all, I want the final scores in two columns that read down each column, so that twelve names fit on one TV screen.
34. As a player on the Arabic Jeopardy board, I want both result screens in Arabic, right to left, in the Cairo typeface, so that the Arabic board stays native at its climax.
35. As a Jeopardy player, I want the winner line to read "… takes it" (or "… في الصدارة" on the Arabic board), so that Jeopardy keeps its own voice.
36. As the host, I want the second screen to hand back to Home with a button or Space, so that the room is ready to pick the next game.

### The scoreboard row

37. As a player, I want the sticky scoreboard to show this game's scores during a game, headed "This game", so that I can follow the game in play.
38. As the host, I want to hold "This game" to show tonight's ranked standings, headed "Tonight", and have it snap back on release, so that the room can check the night without the row ever being left on the wrong view.
39. As a player on Home, I want the row to show tonight's ranked standings, so that I can see who leads the night between games.
40. As a player in a 12-player free-for-all, I want the row to wrap onto several lines instead of shrinking or taking width from the game, so that every name stays readable.

### Correcting scores

41. As the host, I want to double-click a game-score chip during a game and type over it (Enter saves, Esc or clicking away cancels), so that I can fix a mis-award without leaving the game.
42. As the host, I want a single click on a chip to do nothing, so that a stray click can't start an edit.
43. As the host, I want to correct a finished game by double-clicking an entity's chip in the Tonight row on Home, which lists that entity's finished games with editable game scores, so that I can fix a result after the game has ended.
44. As a player, I want a correction to a finished game to recalculate its placement points (places and pie) and the night standings at once, so that the standings are always right.
45. As a player, I want corrections to the game in progress to change only its game scores, so that the standings only move when a game ends.
46. As the host, I want negative game scores accepted only in Jeopardy, with a message such as "Emoji scores can't go below 0" elsewhere, so that a stray minus sign can't corrupt a game.
47. As the host, I want only whole numbers accepted, so that game scores stay clean.
48. As the host, I want corrections never to change turn counts, so that fixing a score doesn't disturb the uneven-turns warning.

### Game in progress and leaving

49. As the host, I want leaving a game via Home to keep it in progress, with its launch card reading "Resume …", so that stepping away doesn't lose the game.
50. As the host, I want resuming to return to the step before whatever was mid-way (the board, the hand-off, "Start"), so that a secret isn't shown again and a timer isn't cheated.
51. As the host, I want launching a different game while one is in progress to ask "Wavelength is still in progress. End it and start Emoji?", running End game and the result screens on yes and cancelling on no, so that there is only ever one game in progress.
52. As the host, I want Outburst's card on Home greyed out with "Teams only" in free-for-all, so that the room knows why it can't be played.

### Jeopardy boards

53. As the host, I want the English and Arabic boards to be separate Jeopardy games, so that we can play one or both, each with its own result.
54. As the host, I want a board whose game has ended (at its Final or early) to show "Played tonight" and not be startable again until New night, so that the room never replays clues it has already heard.
55. As the host, I want the Jeopardy card on Home to read "Both boards played tonight" once both are played, so that I don't open an empty picker.
56. As the host, I want launching Jeopardy with a board in progress to go straight into that board, so that I can't open the other board mid-game.
57. As a Jeopardy player, I want the existing rules to stand (a wrong normal clue costs nothing; Daily Double and Final wagers swing both ways and Final wagers are capped at the team's current score; the Daily Double never sits in the 100 row), so that the game plays as before and only its conversion into the standings changes.

### Saving and resuming the night

58. As the host, I want the night saved after every change (each award, each clue used, each setup edit) and to survive a reload, closed tab, browser crash or restart, so that an accident never loses the night.
59. As the host, I want a full-screen "Continue tonight?" card on load when the saved night has a finished game or a game in progress, showing the entities, finished-game count, the game in progress and the standings, so that I can pick the night back up or start over.
60. As the host, I want Continue to return to the game in progress (at the step before whatever was mid-way) or to Home, so that play carries on where it stopped.
61. As the host, I want "Start a new night" on that card to go through the New night confirm, so that one misclick can't wipe the night.
62. As the host, I want a saved night with only a setup to be restored silently onto Home, so that I'm not asked about nothing.
63. As the host, I want Jeopardy's board progress (used clues, Daily Double positions, Final done, played) saved, but other games' decks reshuffled on resume, so that the one progress worth keeping is kept.
64. As the host, I want a "New night" button on Home with the confirm "This clears tonight's standings and every finished game. Start a new night?", not reachable from inside a game, so that clearing the night is deliberate.

### Changing the setup mid-night

65. As the host, I want setup to stay as free as today before the first finished game (with no game in progress), so that setting up is unchanged.
66. As the host, I want to rename a team or player any time, keeping its games and standing, so that a typo is harmless.
67. As the host, I want the mode buttons (teams, free-for-all) and the 2 / 3 / 4-team buttons locked from the first finished game until New night, with a line like "Start a new night to change this.", so that results can't be scrambled across modes.
68. As a latecomer, I want to join at 0 and earn from the next game, so that I can play without anyone's past points changing.
69. As the host, I want an "Add team" button (up to 4 teams) and the existing add-player field to work between games, so that I can add a team or player without breaking the night.
70. As a player who goes home early, I want to be marked Left, keeping my results in the games I played, so that nobody else's placement points change because I left.
71. As a player who comes back, I want a Back control that restores me with everything I had, so that I'm not split across two names.
72. As the host, I want Left entities off the Tonight row, the result screens and future games, but still in their finished games for corrections, so that the standings show who's still playing.
73. As the host, I want adding and leaving blocked while a game is in progress, so that turn counts and game scores never lose an entity mid-game.
74. As the host, I want a leave that would drop the night below 2 entities to ask "Only Karim would be left, so the night can't go on. End it and start a new night?", going to New night on yes and cancelling the leave on no, so that a night never runs with one entity.

## Implementation Decisions

### A new Night module (deep module; the one test seam)

- A pure module, with no DOM access, owns the night: the mode, the entities (with a left flag), the finished games, the game in progress, and the Jeopardy board progress. It is the single source of truth. The existing shared scoreboard state (mode, team names, free-for-all players, a flat score array) is folded into it and retired; game modules and the setup screen read and change the night only through its operations.
- **Entities get stable ids.** Game scores, turn counts and Left status are keyed by entity id, never by position. Today, removing a player wipes every score because scores are positional; stable ids make leaving, coming back and renaming safe. An entity's colour stays tied to it, not to its position in the list.
- **Operations** (names are indicative; the shape is the decision):
  - `newNight()`: an empty night.
  - Setup: `setMode`, `setTeamCount` (both refused once the night has a finished game or a game in progress), `addEntity` (refused while a game is in progress), `rename` (always allowed), `leave` / `back` (refused while a game is in progress; `leave` reports "would end the night" instead of acting when fewer than 2 entities that haven't left would remain).
  - Play: `startGame(type, board?)` (refused while another game is in progress, for a played Jeopardy board, or for Outburst in free-for-all), `award(entity, points)` (adds to the game in progress), `confirmTurn(entity)`, `endGame()` (returns what the result screens need: the ended game's type and board, its game scores, each entity's placement points earned, and the standings before and after).
  - Corrections: `setGameScore(gameRef, entity, value)`, for the game in progress or any finished game. It rejects non-integers, and rejects negatives unless the game type is Jeopardy. It never changes turn counts.
  - Queries: `standings()` (ranked, ties sharing a place, entities that haven't left only), `gameInProgress()`, `finishedGames()`, `unevenTurns()` (who is short, for the confirm), `nextTurn()` (fewest turns, ties to next in order), `boardStatus(board)` (fresh / in progress / played).
  - Persistence: `serialize(night)` / `deserialize(data)`, round-tripping exactly.
- **Night standings are always derived** from the finished games' game scores, never stored or edited. The game in progress contributes nothing until it ends.
- **Rules the module enforces**, all decided on the map: a single game in progress; a Jeopardy board playable once per night; mode and team count locked after the first finished game; never below 2 entities that haven't left; Outburst teams-only.

### Placement formula (inside the Night module)

Place points 5 / 3 / 1 by rank (4th and below 0); tied entities share the better place; negatives rank normally. The pie goes to positive scores; if there are none, entities at 0 split it equally; if every score is negative, it is split by the inverse of each score's size; if every score is exactly 0, there is no pie. The weight multiplies place points plus pie, and the result is rounded to the nearest whole number with halves up. This snippet came from the edit-surface prototype and was checked against every worked case in "How are ties and negative game scores placed?":

```ts
function placement(scores: number[], weight: number): number[] {
  const place = scores.map((s) => [5, 3, 1][scores.filter((o) => o > s).length] ?? 0);
  let pie = scores.map(() => 0);
  const pos = scores.filter((s) => s > 0);
  if (pos.length) {
    const sum = pos.reduce((a, b) => a + b, 0);
    pie = scores.map((s) => (s > 0 ? Math.round((10 * s) / sum) : 0));
  } else if (scores.some((s) => s === 0) && scores.some((s) => s !== 0)) {
    const zeros = scores.filter((s) => s === 0).length;
    pie = scores.map((s) => (s === 0 ? Math.round(10 / zeros) : 0));
  } else if (scores.every((s) => s < 0)) {
    const inv = scores.reduce((a, s) => a + 1 / -s, 0);
    pie = scores.map((s) => Math.round((10 * (1 / -s)) / inv));
  }
  return scores.map((_, i) => Math.round((place[i] + pie[i]) * weight));
}
```

A game ranks only the entities that played it. Entities that joined later are absent from it, and Left entities stay in it as they were.

### Weights config

A typed config maps game type to weight: Emoji 1, Act It Out 1.5, Wavelength 1.5, Outburst 2, Jeopardy 4 (one weight for both boards). Nothing adjusts it at runtime.

### Turn tracking

Wavelength, Act It Out and Outburst record a turn when the host confirms a round's result (including 0 points); Act It Out's "Another turn" records nothing. Emoji and Jeopardy have no turns; a Daily Double isn't a turn. Outburst changes from "everyone else calls out" to "your team calls out", credits the team whose turn it is, and reaches its natural finish at the last full lap.

### Saved night

- One saved night in localStorage, overwritten after every change. No history.
- It contains the mode; the entities (id, name, left flag, and colour if stored); the finished games in play order (type, board for Jeopardy, game scores by entity id); the game in progress (type, board, game scores, turn counts); and Jeopardy board progress per board (used clues, Daily Double position, Final done, played).
- It never contains mid-step state (an open clue, a placed wager, a revealed Wavelength target, a running timer) or deck positions for Emoji, Wavelength, Act It Out or Outburst.
- Carry a format version, so that a later change can migrate or discard an old saved night instead of crashing. If a saved night can't be read, fall back to a fresh night rather than failing to load.
- On load, the "Continue tonight?" card appears only when the saved night has a finished game or a game in progress.
- Mafia isn't part of the night and isn't saved.

### Screens and UI changes

- **Scoreboard row:** one row. During a game it shows game scores under a "This game" label; pressing and holding that label (pointer down, window-level pointer up or cancel) switches the row to the ranked standings under "Tonight" until release. On Home it shows the ranked standings under a static "Tonight". Game-score chips support double-click-to-edit; Tonight chips on Home open that entity's finished games for correction. Left entities are not shown.
- **Top bar:** gains End game next to Home, shown only while a game is in progress.
- **End-of-game screens:** a new full-screen flow with two beats, then Home, as described in the stories. Beat 2 renders rows in the old order, holds briefly, then moves each row to its new position (a positional transition) while its total updates and its +N fades in. Confetti is a single short burst on beat 1, needs no external asset, and is skipped under `prefers-reduced-motion`. Both beats follow the board's language and direction for Arabic Jeopardy.
- **Continue tonight card and New night confirm:** new, full-screen, readable from across the room.
- **Home launch cards:** show "Resume …" for the game in progress, "Played tonight" per Jeopardy board in the picker, "Both boards played tonight" on the Jeopardy card, and "Teams only" for Outburst in free-for-all.
- **Setup area:** mode and team-count buttons show a locked state after the first finished game; each entity row gains a Left control; there is a Left list with Back; there is an "Add team" button.
- **Game modules:** keep module-local state for their own flow (decks, phases, timers), but read entities and write scores and turns through the Night module. Jeopardy's own "Final standings" screen and "Play the other board" are removed. Emoji's "Reshuffle and go again" and Outburst's "ALL ROUNDS COMPLETE" card become natural-finish prompts. Every existing `stop*Timer()` still runs when leaving a screen, including on End game.

### Conventions kept

Every screen is a hidden `<section>` registered in the screen list; `escapeHtml()` is applied to every entity name that reaches `innerHTML`; Arabic content uses `dir="rtl"` and the `.ar` class; there is no framework.

## Testing Decisions

- **One seam: the Night module's public operations.** Tests set up a night, play games through the operations, and assert on the returned result, `standings()` and the other queries. They never reach into internal fields or the DOM. A good test reads like a night at the party: "two teams, Emoji 6–4, Jeopardy 800–900, correct Jeopardy to 1400, check the standings".
- **Add Vitest** as the one dev dependency, with a `test` script. `npm run build` stays the typecheck-and-bundle gate.
- **Cover at least:**
  - Every worked case from "How are ties and negative game scores placed?" and "How do game scores convert into placement points?", including ties, all zeros, all negatives, a 0 among negatives, and a blowout.
  - Weights and rounding: a 1.5× game rounding halves up; rounding never ranks a bigger total below a smaller one.
  - The game in progress not affecting standings until `endGame`; corrections to finished games recalculating immediately; corrections never touching turn counts.
  - Negatives accepted only for Jeopardy; non-integers rejected.
  - Uneven-turns detection and the fewest-turns preselection, in teams and free-for-all; Act It Out's do-over not counting.
  - Replays as new games; each Jeopardy board playable once; only one game in progress.
  - Setup rules: locks after the first finished game; join at 0; Left keeps past games unchanged for everyone else; Back restores; leave blocked mid-game; the below-2 case reported, not applied.
  - `serialize` / `deserialize` round-tripping every night shape above, including Jeopardy board progress and Left entities; an unreadable or old-version saved night falls back to a fresh night.
- **Prior art:** there is no automated test in the repo yet. The three prototypes on throwaway branches are the reference for expected behaviour: `prototype/placement-formula` (the formula and guided nights), `prototype/edit-surface` (corrections re-ranking a finished game) and `prototype/end-of-game-screen` (the two beats).
- **By hand**, per CLAUDE.md, after `npm run build` and `npm run preview`:
  - Holding "This game" and releasing it.
  - Double-click editing.
  - Both beats with 2 teams, 4 teams and 12 players.
  - The Arabic board's result screens (right to left, Cairo).
  - Confetti, with and without reduced motion.
  - Reload mid-Jeopardy, then Continue.
  - New night.
  - No timer left running after End game or Home.

## Out of Scope

- **Mafia in the night standings.** Mafia keeps its own players and win condition (CLAUDE.md).
- **Per-award history and undo.** Corrections set a game score directly.
- **A "night over" screen** crowning the night's winner. Ending a night is "New night".
- **Automatic or per-mode weights.** Weights change only by editing the config.
- **Normalising uneven turns** (e.g. points per turn). The host is warned and may end anyway.
- **Distinct colours for more than 4 entities** in free-for-all. Colours repeat, as today.
- **Saving other games' deck positions** or any mid-step state.

## Further Notes

- The decisions came out of 17 tickets on the map; each "Decisions so far" line links the ticket with the full reasoning and the rejected alternatives. The vocabulary (Night, Entity, Left, Turn, Game in progress, Natural finish, Game score, Placement points, Place points, Pie share, Weight, Night standings) is defined in the domain glossary at the repo root and should be used in code names as well.
- The prototypes are throwaway: lift decisions and the placement snippet, not their code. Their "End game in the scoreboard row" button was only a stand-in; End game belongs in the top bar.
- CLAUDE.md's "Mafia does not use the shared scoreboard" and its Jeopardy wager rules still hold. Once this ships, CLAUDE.md's architecture notes (the scoreboard as shared state, `award()` as the single running total) will be out of date and should be updated in the same change.
