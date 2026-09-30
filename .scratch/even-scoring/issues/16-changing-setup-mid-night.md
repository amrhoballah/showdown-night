# Once a night has a finished game, what may the host change in the setup?

Type: grilling
Status: resolved
Assignee: Hussein Rzikana
Blocked by:

## Question

The saved night restores its own setup, so it can't mismatch on load ("What does a saved night contain, and where is it stored?"). But on Home the host can still rename an entity, add or remove a team or player, or switch between teams and free-for-all after games have been played. Today any mode change silently wipes every score. Once a night has at least one finished game (or a game in progress), which of these changes are allowed, and what happens to the finished games' game scores and the night standings for each one? For example: a latecomer joins a free-for-all after two games; a player leaves; the host renames a team; the host switches 2 teams to 3. A fresh start is always available through "New night".

## Answer

**Renaming is always allowed; mode is locked; entities join at 0 or leave with their results kept, only between games; the night never drops below 2.** Resolved by grilling, 2026-09-28.

- **Before the first finished game** (and with no game in progress), setup stays as free as today: mode, team count and players change at will, no locks, no "Left".
- **Renaming** a team or player: allowed any time, mid-game included. The entity keeps its finished games and standing; only the label changes.
- **Mode (teams ↔ free-for-all) and the 2 / 3 / 4-team buttons:** locked from the first finished game until "New night", with a line like "Start a new night to change this." A team's placement points can't be split among players, or players' merged into teams.
- **Adding an entity** ("Add team", up to 4; or a new free-for-all player): only when no game is in progress. It **joins at 0**, is absent from the finished games, and earns from the next game. No head start.
- **Leaving:** only when no game is in progress, through a per-entity **Left** control (per team in team mode; replaces the free-for-all ×). A left entity:
  - keeps its results in the finished games it played, so **nobody else's placement points change** (no recalculation without it);
  - drops off the Tonight row, the end-of-game night standings and future games;
  - stays reachable for score corrections to its past games;
  - is listed under the setup with a **Back** control. Coming back restores it with everything it had; it simply missed the games played meanwhile.
- **Never below 2 entities who haven't left.** If marking one as left would leave fewer than 2, the host is asked instead, e.g. "Only Karim would be left, so the night can't go on. End it and start a new night?" **Yes** goes through "New night" and clears everything ("What does a saved night contain, and where is it stored?"); **No** cancels the leave.
- **While a game is in progress:** nobody is added, leaves, or switches mode; renaming only. This holds whichever way "How does each game's existing flow change around End game?" settles whether a game stays in progress while the host is on Home.

Glossary: **Left** added to `CONTEXT.md`.

Rejected: a head start for latecomers (the lowest or average total); erasing a leaving entity and recalculating finished games without it (it shifts everyone else's past points); dropping the last team via the team-count buttons (it may not be the team that left); adding a returning player as a new entity at 0 (it splits one person across two names).

Ruled out of scope: a "night over" screen crowning the night's winner.
