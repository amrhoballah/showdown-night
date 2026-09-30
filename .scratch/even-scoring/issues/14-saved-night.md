# What does a saved night contain, and where is it stored?

Type: grilling
Status: resolved
Assignee: Hussein Rzikana
Blocked by:

## Question

The night survives a reload ("Does the night survive a page reload?"). localStorage (survives closing the tab/browser) or sessionStorage (only this tab)? What is saved: entities and mode, finished games' game scores, the in-progress game's scores, in-progress game state such as Jeopardy board progress? How does the host start a fresh night, and what happens to a saved night whose teams no longer match the setup?

## Answer

**One saved night in localStorage, saved after every change, offered back on load with a "Continue tonight?" prompt.** Resolved by grilling, 2026-09-28.

- **Where:** localStorage, so the night survives a closed tab, a browser crash or a restart, not just a reload. There is exactly one **saved night**, always current and overwritten after every change (each award, each Jeopardy clue used, each setup edit). No snapshots, no history.
- **What it contains:**
  - **The night:** mode, entities, and every finished game's type and game scores, in play order. Night standings are never saved; they are recomputed from the game scores (see "How does the host correct a wrong score?").
  - **The game in progress:** its type, game scores and turn counts (the turn counts feed the uneven-turns warning).
  - **Jeopardy board progress only:** used clues per board, Daily Double positions, and whether Final Jeopardy is done on each board.
- **Never saved:** anything mid-step: an open clue, a placed wager, a revealed Wavelength target, a running timer. A reload resumes at the step before (the board, the hand-off, "Start"), so a secret is never shown again and a countdown is never cheated. Other games' deck positions aren't saved; they reshuffle. Mafia isn't saved (it's outside the night standings).
- **Opening the app with a saved night:** if it has a finished game or a game in progress, a full-screen **"Continue tonight?"** card, readable across the room, shows the entities, how many games are finished, the game in progress and the night standings.
  - **Continue** lands back in the game in progress at the step before whatever was mid-way, or on Home if there is none.
  - **Start a new night** goes through the same confirm as the Home button.
  - A saved night with only a setup (no game finished or started) is restored silently onto Home, with no prompt.
- **Starting a fresh night:** a **"New night"** button on Home, next to the setup, with a confirm ("This clears tonight's standings and every finished game. Start a new night?"). It clears entities, games and standings. Not reachable from inside a game.
- **Teams not matching the setup:** can't happen on load, because the setup is part of the saved night and is restored with it. Changing the setup mid-night is its own question: see "Once a night has a finished game, what may the host change in the setup?".

Glossary: **Night** added to `CONTEXT.md` (ends only when the host starts a new one, never on a clock).

Rejected: sessionStorage (loses the night when a tab is closed or the browser crashes); resuming silently on load (the host chose to be asked); saving only at game or turn boundaries (loses the game in progress); saving deck positions and mid-step state for every game.
