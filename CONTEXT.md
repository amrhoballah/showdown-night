# Showdown Night

A party game console for one shared screen: a room of people, split into teams or playing free-for-all, plays a series of games across one night.

## Language

### Who plays

**Night**:
One run of play, from when the host starts it until the host starts a fresh one: its entities, its finished games and the game in progress. It ends only when the host starts a new night, never on a clock.
_Avoid_: Session, evening, party

**Entity**:
One scoring unit on the night: a team in team mode, or a single player in free-for-all.
_Avoid_: Contestant, side

**Left**:
An entity that has dropped out of the night: it plays no more games and is off the night standings, but it stays in the finished games it played, so nobody else's placement points change.
_Avoid_: Removed, deleted, inactive

**Turn**:
One round of a turn-based game (Wavelength, Act It Out, Outburst) that belongs to a single entity, counted once the host confirms its result, even at 0 points.
_Avoid_: Go, round (when meaning one entity's round)

### Games

**Game in progress**:
The one game that has been started tonight and not yet ended. There is at most one; leaving it for Home doesn't end it.
_Avoid_: Current game, active game, open game

**Natural finish**:
The point where a game has nothing left to play (Final Jeopardy settled, the last Emoji riddle, Outburst's last full lap), at which the host is prompted to end it.
_Avoid_: Game over, auto-end

### Scoring

**Game score**:
The points an entity earns inside one game, on that game's own scale (a Jeopardy total of 1,400; 6 Emoji answers).
_Avoid_: In-game score, raw score, round score

**Placement points**:
What an entity earns from a game when it ends: its place points plus its pie share, adjusted by the game type's weight.
_Avoid_: Bonus, normalized score

**Place points**:
The part of placement points earned by finishing position alone (1st, 2nd, 3rd); tied entities share the better place.
_Avoid_: Rank bonus, position score

**Pie share**:
The part of placement points earned by how an entity's game score compares with the others', out of a fixed pie; usually its share of the game's total.
_Avoid_: Margin bonus, proportional points

**Weight**:
A fixed multiplier per game type, set from how long that game is expected to take, that sets how much its placement points count in the night standings.
_Avoid_: Multiplier, game value

**Night standings**:
The running total of placement points across every game played tonight; what the sticky scoreboard shows.
_Avoid_: Scoreboard total, overall score, leaderboard
