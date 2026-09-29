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
 *  Setup changes never touch results: the mode is locked once a game has
 *  finished, latecomers join at 0, and an entity who goes home is marked Left
 *  and keeps its past results.
 */

import type { Lang } from './types';
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
  /** Dropped out of the night: kept in the games it played, off the
   *  standings and out of future games until it comes back. */
  left?: boolean;
}

/** Game scores by entity id. A missing id scores 0. */
export type GameScores = Record<EntityId, number>;

/** A Jeopardy board. Each board is its own game, played at most once a night. */
export type Board = Lang;

export interface GameInProgress {
  type: GameType;
  /** Which board, for Jeopardy. */
  board?: Board;
  scores: GameScores;
  /** Confirmed turns by entity id, in games that have turns. */
  turns: Record<EntityId, number>;
  /** Who took the most recent turn, so ties for the next turn rotate. */
  lastTurn: EntityId | null;
}

export interface FinishedGame {
  type: GameType;
  /** Which board, for Jeopardy. */
  board?: Board;
  /** The entities that played it, in order. Only they are ranked in it. */
  entityIds: EntityId[];
  scores: GameScores;
}

/** How far a Jeopardy board has got tonight. Whether it has been played is
 *  derived from the finished games, not stored here. */
export interface BoardProgress {
  /** Clue keys ("category-row") already used. */
  used: string[];
  /** Where its Daily Double hides, once the board has been picked. */
  dailyDouble: string | null;
  finalDone: boolean;
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
  /** Jeopardy progress per board. */
  boards: Record<Board, BoardProgress>;
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
  board?: Board;
  /** Each entity that played, with its final game score, in entity order. */
  gameScores: { entity: NightEntity; score: number }[];
  /** Placement points each entity earned from this game, by id. */
  earned: Record<EntityId, number>;
  before: Standing[];
  after: Standing[];
}

/** A night with no mode chosen yet and the first two default teams named. */
export function newNight(): Night {
  const night: Night = {
    mode: null,
    teams: [],
    players: [],
    games: [],
    current: null,
    boards: { en: freshBoard(), ar: freshBoard() },
    nextId: 1,
  };
  night.teams = TEAM_NAME_DEFAULTS.slice(0, 2).map((name, i) => create(night, name, i));
  return night;
}

function freshBoard(): BoardProgress {
  return { used: [], dailyDouble: null, finalDone: false };
}

function create(night: Night, name: string, slot: number): NightEntity {
  return { id: night.nextId++, name, color: TEAM_COLORS[slot % TEAM_COLORS.length] };
}

// ---------- setup ----------

/** The mode and team count are locked once a game has finished (until New
 *  night), so results can't be scrambled across modes; and while a game is in
 *  progress. Before that, setup is free. */
export function setupLocked(night: Night): boolean {
  return night.games.length > 0 || !!night.current;
}

/** Switch to team mode with `count` teams. Existing teams keep their names and
 *  colours; extra slots get the default names; surplus teams are dropped.
 *  Refused (false) once setup is locked. */
export function setTeams(night: Night, count: number): boolean {
  if (setupLocked(night)) return false;
  night.mode = 'teams';
  night.teams = Array.from(
    { length: count },
    (_, i) => night.teams[i] ?? create(night, TEAM_NAME_DEFAULTS[i % TEAM_NAME_DEFAULTS.length], i),
  );
  return true;
}

/** Switch to free-for-all. The player list is kept. Refused once setup is locked. */
export function setFreeForAll(night: Night): boolean {
  if (setupLocked(night)) return false;
  night.mode = 'ffa';
  return true;
}

/** Add a free-for-all player at 0: absent from the finished games, earning
 *  from the next. Refused (null) while a game is in progress. */
export function addPlayer(night: Night, name: string): NightEntity | null {
  if (night.current) return null;
  const p = create(night, name, night.players.length);
  night.players.push(p);
  return p;
}

/** Add a team at 0, between games, up to 4 teams (counting any who left).
 *  Refused (null) outside team mode, mid-game or at 4. */
export function addTeam(night: Night): NightEntity | null {
  if (night.current || night.mode !== 'teams' || night.teams.length >= TEAM_NAME_DEFAULTS.length) {
    return null;
  }
  const i = night.teams.length;
  const t = create(night, TEAM_NAME_DEFAULTS[i], i);
  night.teams.push(t);
  return t;
}

/** Remove a free-for-all player outright. Only while setup is still free
 *  (nothing played): after that, a player who goes home is marked Left. */
export function removePlayer(night: Night, id: EntityId): boolean {
  if (setupLocked(night)) return false;
  night.players = night.players.filter((p) => p.id !== id);
  return true;
}

/** Rename a team or player, any time. Its results and colour are untouched. */
export function rename(night: Night, id: EntityId, name: string): void {
  const e = allEntitiesOf(night).find((x) => x.id === id);
  if (e) e.name = name;
}

/** Why a leave or a return was refused: mid-game, or (for a leave) because
 *  fewer than 2 would be left, so the night can't go on. */
export type LeaveRefusal = 'in-game' | 'would-end-night';

/** Mark an entity as Left, between games. It keeps its results in the games
 *  it played, so nobody else's placement points change, but drops off the
 *  standings and future games. Returns why it was refused, or null. A leave
 *  that would leave fewer than 2 is reported, not applied. */
export function leave(night: Night, id: EntityId): LeaveRefusal | null {
  if (night.current) return 'in-game';
  const e = entitiesOf(night).find((x) => x.id === id);
  if (!e) return null;
  if (entitiesOf(night).length - 1 < 2) return 'would-end-night';
  e.left = true;
  return null;
}

/** Bring a Left entity back with everything it had, between games. */
export function back(night: Night, id: EntityId): LeaveRefusal | null {
  if (night.current) return 'in-game';
  const e = leftOf(night).find((x) => x.id === id);
  if (e) delete e.left;
  return null;
}

/** Every team or player in the current mode, Left ones included, in order. */
export function allEntitiesOf(night: Night): NightEntity[] {
  if (night.mode === 'teams') return night.teams;
  if (night.mode === 'ffa') return night.players;
  return [];
}

/** The current scoring units, in order: the teams, or the players, who
 *  haven't left. None before a mode is chosen. */
export function entitiesOf(night: Night): NightEntity[] {
  return allEntitiesOf(night).filter((e) => !e.left);
}

/** The entities who have left, in order. */
export function leftOf(night: Night): NightEntity[] {
  return allEntitiesOf(night).filter((e) => e.left);
}

// ---------- play ----------

export function gameInProgress(night: Night): GameInProgress | null {
  return night.current;
}

/** Start a game of `type` (and, for Jeopardy, on `board`). Refused (returns
 *  false) while another game is in progress, when there is nobody to play it,
 *  for Outburst in free-for-all (one person shouting alone isn't Outburst),
 *  for Jeopardy without a board, or on a board already played tonight (its
 *  clues and Daily Double are known). */
export function startGame(night: Night, type: GameType, board?: Board): boolean {
  if (night.current || entitiesOf(night).length === 0) return false;
  if (type === 'outburst' && night.mode === 'ffa') return false;
  if (type === 'jeopardy' && (!board || boardStatus(night, board) === 'played')) return false;
  night.current = { type, scores: {}, turns: {}, lastTurn: null };
  if (type === 'jeopardy' && board) {
    night.current.board = board;
    // A board's game always starts fresh; a played board can't be restarted.
    night.boards[board] = freshBoard();
  }
  return true;
}

// ---------- Jeopardy board progress ----------

export function boardProgress(night: Night, board: Board): BoardProgress {
  return night.boards[board];
}

export function hideDailyDouble(night: Night, board: Board, key: string): void {
  night.boards[board].dailyDouble = key;
}

export function useClue(night: Night, board: Board, key: string): void {
  if (!night.boards[board].used.includes(key)) night.boards[board].used.push(key);
}

export function settleFinal(night: Night, board: Board): void {
  night.boards[board].finalDone = true;
}

/** A Jeopardy board tonight: not yet played, its game in progress, or played
 *  (its game ended, at its Final or early). */
export function boardStatus(night: Night, board: Board): 'fresh' | 'in-progress' | 'played' {
  if (night.current?.type === 'jeopardy' && night.current.board === board) return 'in-progress';
  if (night.games.some((g) => g.type === 'jeopardy' && g.board === board)) return 'played';
  return 'fresh';
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
    ...(current.board ? { board: current.board } : {}),
    entityIds: ents.map((e) => e.id),
    scores: { ...current.scores },
  };
  night.games.push(game);
  night.current = null;
  return {
    type: game.type,
    board: game.board,
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

/** How many of `rounds` a turn-based game with a fixed round list can play so
 *  that every one of `entities` gets the same number of turns: the last full
 *  lap. Outburst's 9 categories give 8 rounds for 2 or 4 teams, 9 for 3. */
export function fullLaps(rounds: number, entities: number): number {
  return entities > 0 ? Math.floor(rounds / entities) * entities : 0;
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

// ---------- the saved night ----------

/** Bump when the saved shape changes; an older saved night is then discarded. */
const FORMAT_VERSION = 1;

/** The whole night as text, for localStorage. Standings aren't included:
 *  they are always derived from the game scores. */
export function serialize(night: Night): string {
  return JSON.stringify({ version: FORMAT_VERSION, night });
}

/** Read a saved night back. Anything unreadable - missing, corrupt, an
 *  unknown version or the wrong shape - gives a fresh night instead, so a
 *  bad save can never stop the app from loading. */
export function deserialize(data: string | null): Night {
  try {
    const parsed = JSON.parse(data ?? '');
    if (parsed?.version === FORMAT_VERSION && isNight(parsed.night)) return parsed.night;
  } catch {
    // fall through
  }
  return newNight();
}

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const isInt = (x: unknown): x is number => Number.isInteger(x);
const isScores = (x: unknown) => isObj(x) && Object.values(x).every(isInt);
const GAME_TYPES: readonly unknown[] = ['jeopardy', 'outburst', 'act', 'emoji', 'wavelength'];
const BOARDS: readonly unknown[] = ['en', 'ar'];

function isEntity(x: unknown): boolean {
  return (
    isObj(x) &&
    isInt(x.id) &&
    typeof x.name === 'string' &&
    typeof x.color === 'string' &&
    (x.left === undefined || typeof x.left === 'boolean')
  );
}

function isGame(x: unknown): boolean {
  return (
    isObj(x) &&
    GAME_TYPES.includes(x.type) &&
    (x.board === undefined || BOARDS.includes(x.board)) &&
    isScores(x.scores)
  );
}

function isBoardProgress(x: unknown): boolean {
  return (
    isObj(x) &&
    Array.isArray(x.used) &&
    x.used.every((k) => typeof k === 'string') &&
    (x.dailyDouble === null || typeof x.dailyDouble === 'string') &&
    typeof x.finalDone === 'boolean'
  );
}

function isNight(x: unknown): x is Night {
  if (!isObj(x)) return false;
  const { mode, teams, players, games, current, boards, nextId } = x;
  return (
    (mode === null || mode === 'teams' || mode === 'ffa') &&
    Array.isArray(teams) &&
    teams.every(isEntity) &&
    Array.isArray(players) &&
    players.every(isEntity) &&
    Array.isArray(games) &&
    games.every((g) => isGame(g) && Array.isArray(g.entityIds) && g.entityIds.every(isInt)) &&
    (current === null ||
      (isGame(current) &&
        isScores((current as Record<string, unknown>).turns) &&
        ((current as Record<string, unknown>).lastTurn === null ||
          isInt((current as Record<string, unknown>).lastTurn)))) &&
    isObj(boards) &&
    isBoardProgress(boards.en) &&
    isBoardProgress(boards.ar) &&
    isInt(nextId)
  );
}
