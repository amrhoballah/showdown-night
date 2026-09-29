# 10: Changing the setup mid-night

Spec: [Even scoring across games](../../even-scoring/spec.md). Vocabulary: the domain glossary (`CONTEXT.md`).

**What to build:** Setup changes no longer wipe scores. Before the first finished game, setup stays as free as today. After it: renaming is always allowed; the mode and team count are locked until New night; latecomers join at 0; an entity who goes home is marked **Left** and keeps its results; and a Left entity can come **Back**. Adding and leaving happen only between games, and the night never drops below 2 entities who haven't left.

**Blocked by:** 09: Saved night, Continue, and New night

**Status:** ready-for-agent

- [ ] With no finished game and no game in progress, setup behaves as today.
- [ ] Renaming a team or player is allowed any time (mid-game included); the entity keeps its games and standing.
- [ ] From the first finished game until New night, the mode buttons and the 2 / 3 / 4-team buttons are locked, with a line like "Start a new night to change this."
- [ ] Between games, "Add team" (up to 4) and the free-for-all add field add an entity at 0; it is absent from the finished games and earns from the next game.
- [ ] Between games, each entity has a Left control (it replaces the free-for-all ×). A Left entity keeps its results in the finished games it played (nobody else's placement points change), drops off the Tonight row, the result screens and future games, and stays correctable. Left entities are listed under the setup with a Back control that restores them with everything they had.
- [ ] While a game is in progress, adding, leaving and mode changes are refused.
- [ ] A leave that would leave fewer than 2 entities who haven't left asks "Only <name> would be left, so the night can't go on. End it and start a new night?"; yes goes through New night; no cancels the leave.
- [ ] The saved night includes Left status and restores it.
- [ ] Tests cover the locks, joining at 0, Left keeping other entities' points unchanged, Back, the mid-game refusal and the below-2 case, through the Night's operations.
