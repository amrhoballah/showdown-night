/** The night: who is playing, the games they have finished, and the game in
 *  progress.
 *
 *  A pure module with no DOM access, so the scoring rules can be tested on
 *  their own. Every entity (a team, or a player in free-for-all) has a stable
 *  id, and game scores are keyed by that id rather than by position in a list.
 *
 *  Awards go into the game in progress's game scores. Ending a game converts
 *  them into placement points, and the night standings are always derived
 *  from the finished games - never stored - so the game in progress counts
 *  for nothing until it ends.
 *
 *  Setup changes still clear the whole night (every game) when the mode or
 *  team count changes or a player is removed, as the old scoreboard did.
 */

import { WEIGHTS } from './weights';

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

/** Every game that feeds the night standings. Mafia is deliberately absent. */
export type GameType = 'jeopardy' | 'outburst' | 'act' | 'emoji' | 'wavelength';

export type EntityId = number;

/** A team or, in free-for-all, a single player. */
export interface NightEntity {
  id: EntityId;
  name: string;
  color: string;
}

/** Game scores by entity id. A missing id scores 0. */
export type GameScores = Record<EntityId, number>;

export interface GameInProgress {
  type: GameType;
  scores: GameScores;
  /** Confirmed turns by entity id, in games that have turns. */
  turns: Record<EntityId, number>;
  /** Who took the most recent turn, so ties for the next turn rotate. */
  lastTurn: EntityId | null;
}

export interface FinishedGame {
  type: GameType;
  /** The entities that played it, in order. Only they are ranked in it. */
  entityIds: EntityId[];
  scores: GameScores;
}

export interface Night {
  mode: Mode;
  /** The teams, used in team mode. Kept while in free-for-all, as the old state did. */
  teams: NightEntity[];
  /** The players, used in free-for-all. Kept while in team mode. */
  players: NightEntity[];
  /** Finished games, in play order. */
  games: FinishedGame[];
  current: GameInProgress | null;
  nextId: EntityId;
}

/** One row of the night standings. Tied totals share the better place. */
export interface Standing {
  entity: NightEntity;
  total: number;
  place: number;
}

/** What ending a game produces, for the result screens. */
export interface EndedGame {
  type: GameType;
  /** Each entity that played, with its final game score, in entity order. */
  gameScores: { entity: NightEntity; score: number }[];
  /** Placement points each entity earned from this game, by id. */
  earned: Record<EntityId, number>;
  before: Standing[];
  after: Standing[];
}

/** A night with no mode chosen yet and the first two default teams named. */
export function newNight(): Night {
  const night: Night = { mode: null, teams: [], players: [], games: [], current: null, nextId: 1 };
  night.teams = TEAM_NAME_DEFAULTS.slice(0, 2).map((name, i) => create(night, name, i));
  return night;
}

function create(night: Night, name: string, slot: number): NightEntity {
  return { id: night.nextId++, name, color: TEAM_COLORS[slot % TEAM_COLORS.length] };
}

function clearGames(night: Night): void {
  night.games = [];
  night.current = null;
}

// ---------- setup ----------

/** Switch to team mode with `count` teams. Existing teams keep their names and
 *  colours; extra slots get the default names; surplus teams are dropped.
 *  Clears every game. */
export function setTeams(night: Night, count: number): void {
  night.mode = 'teams';
  night.teams = Array.from(
    { length: count },
    (_, i) => night.teams[i] ?? create(night, TEAM_NAME_DEFAULTS[i % TEAM_NAME_DEFAULTS.length], i),
  );
  clearGames(night);
}

/** Switch to free-for-all. The player list is kept. Clears every game. */
export function setFreeForAll(night: Night): void {
  night.mode = 'ffa';
  clearGames(night);
}

/** Add a free-for-all player at 0. Everyone else keeps their results. */
export function addPlayer(night: Night, name: string): NightEntity {
  const p = create(night, name, night.players.length);
  night.players.push(p);
  return p;
}

/** Remove a free-for-all player. Clears every game, as it always has. */
export function removePlayer(night: Night, id: EntityId): void {
  night.players = night.players.filter((p) => p.id !== id);
  clearGames(night);
}

/** Rename a team or player. Its results and colour are untouched. */
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

// ---------- play ----------

export function gameInProgress(night: Night): GameInProgress | null {
  return night.current;
}

/** Start a game of `type`. Refused (returns false) while another game is in
 *  progress, or when there is nobody to play it. */
export function startGame(night: Night, type: GameType): boolean {
  if (night.current || entitiesOf(night).length === 0) return false;
  night.current = { type, scores: {}, turns: {}, lastTurn: null };
  return true;
}

/** Add (or, with a negative value, subtract) points to an entity's game score
 *  in the game in progress. Does nothing when no game is in progress. */
export function award(night: Night, id: EntityId, pts: number): void {
  if (!night.current) return;
  night.current.scores[id] = gameScoreOf(night, id) + pts;
}

/** An entity's game score in the game in progress (0 when there is none). */
export function gameScoreOf(night: Night, id: EntityId): number {
  return night.current?.scores[id] ?? 0;
}

/** End the game in progress: it joins the finished games and its placement
 *  points count in the standings from now on. Returns null when no game is
 *  in progress. */
export function endGame(night: Night): EndedGame | null {
  const current = night.current;
  if (!current) return null;
  const before = standings(night);
  const ents = entitiesOf(night);
  const game: FinishedGame = {
    type: current.type,
    entityIds: ents.map((e) => e.id),
    scores: { ...current.scores },
  };
  night.games.push(game);
  night.current = null;
  return {
    type: game.type,
    gameScores: ents.map((entity) => ({ entity, score: game.scores[entity.id] ?? 0 })),
    earned: placementOf(game),
    before,
    after: standings(night),
  };
}

export function finishedGames(night: Night): FinishedGame[] {
  return night.games;
}

// ---------- turns ----------

/** Games where each round belongs to one entity. Emoji and Jeopardy are
 *  open buzz-in, so they have none (and a Daily Double isn't a turn). */
const TURN_GAMES: ReadonlySet<GameType> = new Set(['wavelength', 'act', 'outburst']);

export function hasTurns(type: GameType): boolean {
  return TURN_GAMES.has(type);
}

/** Record a turn for an entity once the host confirms its round's result,
 *  even at 0 points. Does nothing outside a game with turns. */
export function confirmTurn(night: Night, id: EntityId): void {
  const game = night.current;
  if (!game || !hasTurns(game.type)) return;
  game.turns[id] = turnsOf(night, id) + 1;
  game.lastTurn = id;
}

/** An entity's confirmed turns in the game in progress. */
export function turnsOf(night: Night, id: EntityId): number {
  return night.current?.turns[id] ?? 0;
}

/** Who should take the next turn: the entity with the fewest turns. Ties go
 *  to the first of them after whoever took the last turn, in entity order, so
 *  an even game rotates. Null when no game with turns is in progress. */
export function nextTurn(night: Night): EntityId | null {
  const game = night.current;
  const ents = entitiesOf(night);
  if (!game || !hasTurns(game.type) || ents.length === 0) return null;
  const fewest = Math.min(...ents.map((e) => turnsOf(night, e.id)));
  const start = ents.findIndex((e) => e.id === game.lastTurn) + 1;
  for (let k = 0; k < ents.length; k++) {
    const e = ents[(start + k) % ents.length];
    if (turnsOf(night, e.id) === fewest) return e.id;
  }
  return null;
}

/** Who is short of turns, for the End game warning: every entity below the
 *  most turns anyone has had, with its count. Null when turns are even or the
 *  game has no turns. */
export function unevenTurns(
  night: Night,
): { short: { entity: NightEntity; turns: number }[]; ahead: NightEntity[]; most: number } | null {
  const game = night.current;
  if (!game || !hasTurns(game.type)) return null;
  const ents = entitiesOf(night);
  const most = Math.max(0, ...ents.map((e) => turnsOf(night, e.id)));
  const short = ents
    .filter((e) => turnsOf(night, e.id) < most)
    .map((entity) => ({ entity, turns: turnsOf(night, entity.id) }));
  if (short.length === 0) return null;
  return { short, ahead: ents.filter((e) => turnsOf(night, e.id) === most), most };
}

// ---------- corrections ----------

/** Which game a correction is for: the game in progress, or a finished game
 *  by its index in `finishedGames()`. */
export type GameRef = 'current' | number;

/** Why a correction was refused. */
export type CorrectionError = 'no-game' | 'not-whole' | 'negative' | 'not-in-game';

/** Set an entity's game score directly. A finished game's placement points
 *  and the night standings follow at once, since both are derived; the game
 *  in progress still counts for nothing until it ends. Only whole numbers,
 *  and negatives only in Jeopardy, where wagers can take a team below 0.
 *  Returns null on success, or why it was refused (nothing changes). */
export function setGameScore(
  night: Night,
  ref: GameRef,
  id: EntityId,
  value: number,
): CorrectionError | null {
  const game = ref === 'current' ? night.current : night.games[ref];
  if (!game) return 'no-game';
  if (!Number.isInteger(value)) return 'not-whole';
  if (value < 0 && game.type !== 'jeopardy') return 'negative';
  if (ref !== 'current' && !night.games[ref].entityIds.includes(id)) return 'not-in-game';
  game.scores[id] = value;
  return null;
}

/** The placement points each entity earned from a finished game, by id. */
export function earnedIn(night: Night, index: number): Record<EntityId, number> {
  const game = night.games[index];
  return game ? placementOf(game) : {};
}

// ---------- scoring ----------

/** Placement points for one game: place points 5 / 3 / 1 by rank (ties share
 *  the better place, negatives rank normally) plus a share of a 10-point pie,
 *  times the game type's weight, rounded to a whole number with halves up.
 *
 *  The pie goes to positive scores by share; with none, the entities at 0
 *  split it; with every score negative, it is split by the inverse of each
 *  score's size; with every score exactly 0 there is no pie. */
export function placement(scores: number[], weight: number): number[] {
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

function placementOf(game: FinishedGame): Record<EntityId, number> {
  const pts = placement(
    game.entityIds.map((id) => game.scores[id] ?? 0),
    WEIGHTS[game.type],
  );
  return Object.fromEntries(game.entityIds.map((id, i) => [id, pts[i]]));
}

/** The night standings: each current entity's placement points summed over
 *  every finished game, highest first. Ties keep entity order and share the
 *  better place. */
export function standings(night: Night): Standing[] {
  const earned = night.games.map(placementOf);
  const rows = entitiesOf(night).map((entity) => ({
    entity,
    total: earned.reduce((sum, g) => sum + (g[entity.id] ?? 0), 0),
  }));
  return rows
    .map((r) => ({ ...r, place: 1 + rows.filter((o) => o.total > r.total).length }))
    .sort((a, b) => a.place - b.place);
}
