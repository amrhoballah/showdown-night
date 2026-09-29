/** The night: who is playing and what they have scored.
 *
 *  A pure module with no DOM access, so the scoring rules can be tested on
 *  their own. Every entity (a team, or a player in free-for-all) has a stable
 *  id, and scores are keyed by that id rather than by position in a list.
 *
 *  This is the start of the Night described in the even-scoring spec. For now
 *  it holds exactly what the old scoreboard state held - the mode, the
 *  entities and one running score each - and behaves the same way, including
 *  clearing every score when the mode changes or a player is removed.
 */

export const TEAM_COLORS = [
  'var(--team-0)',
  'var(--team-1)',
  'var(--team-2)',
  'var(--team-3)',
];

export const TEAM_NAME_DEFAULTS = [
  'Wlad El Balad',
  'El Captains',
  'Sons of the Nile',
  'El Batal Crew',
];

export type Mode = 'teams' | 'ffa' | null;

export type EntityId = number;

/** A team or, in free-for-all, a single player. */
export interface NightEntity {
  id: EntityId;
  name: string;
  color: string;
}

export interface Night {
  mode: Mode;
  /** The teams, used in team mode. Kept while in free-for-all, as the old state did. */
  teams: NightEntity[];
  /** The players, used in free-for-all. Kept while in team mode. */
  players: NightEntity[];
  /** Each entity's running score, by id. A missing id scores 0. */
  scores: Record<EntityId, number>;
  nextId: EntityId;
}

/** A night with no mode chosen yet and the first two default teams named. */
export function newNight(): Night {
  const night: Night = { mode: null, teams: [], players: [], scores: {}, nextId: 1 };
  night.teams = TEAM_NAME_DEFAULTS.slice(0, 2).map((name, i) => create(night, name, i));
  return night;
}

function create(night: Night, name: string, slot: number): NightEntity {
  return { id: night.nextId++, name, color: TEAM_COLORS[slot % TEAM_COLORS.length] };
}

/** Switch to team mode with `count` teams. Existing teams keep their names and
 *  colours; extra slots get the default names; surplus teams are dropped.
 *  Clears every score. */
export function setTeams(night: Night, count: number): void {
  night.mode = 'teams';
  night.teams = Array.from(
    { length: count },
    (_, i) => night.teams[i] ?? create(night, TEAM_NAME_DEFAULTS[i % TEAM_NAME_DEFAULTS.length], i),
  );
  night.scores = {};
}

/** Switch to free-for-all. The player list is kept. Clears every score. */
export function setFreeForAll(night: Night): void {
  night.mode = 'ffa';
  night.scores = {};
}

/** Add a free-for-all player at 0. Everyone else keeps their score. */
export function addPlayer(night: Night, name: string): NightEntity {
  const p = create(night, name, night.players.length);
  night.players.push(p);
  return p;
}

/** Remove a free-for-all player. Clears every score, as it always has. */
export function removePlayer(night: Night, id: EntityId): void {
  night.players = night.players.filter((p) => p.id !== id);
  night.scores = {};
}

/** Rename a team or player. Its score and colour are untouched. */
export function rename(night: Night, id: EntityId, name: string): void {
  const e = [...night.teams, ...night.players].find((x) => x.id === id);
  if (e) e.name = name;
}

/** The current scoring units, in order: the teams, or the players. None before a mode is chosen. */
export function entitiesOf(night: Night): NightEntity[] {
  if (night.mode === 'teams') return night.teams;
  if (night.mode === 'ffa') return night.players;
  return [];
}

export function scoreOf(night: Night, id: EntityId): number {
  return night.scores[id] ?? 0;
}

/** Add (or, with a negative value, subtract) points for one entity. */
export function addPoints(night: Night, id: EntityId, pts: number): void {
  night.scores[id] = scoreOf(night, id) + pts;
}
