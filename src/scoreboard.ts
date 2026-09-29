/** The sticky scoreboard, and the positional adapters over the night.
 *
 *  The night itself (entities with stable ids, games, standings) lives in
 *  `night.ts`. The functions here keep the old index-based interface the game
 *  modules call - `entities()`, `award(i, pts)`, `state.scores[i]` - until
 *  they move onto the night directly. Awards go into the game in progress.
 *  Mafia is the deliberate exception: it tracks its own players and win
 *  condition and never touches these scores.
 *
 *  The row shows the game in progress's game scores under "This game" while
 *  its screens are up. Holding that label shows the night standings under
 *  "Tonight" until release. Everywhere else (Home, Mafia) it shows the
 *  standings.
 */

import type { Entity } from './types';
import {
  newNight,
  entitiesOf,
  allEntitiesOf,
  gameInProgress,
  gameScoreOf,
  standings,
  finishedGames,
  setGameScore,
  earnedIn,
  confirmTurn,
  nextTurn,
  turnsOf,
  serialize,
  deserialize,
  award as awardInNight,
  type Mode,
  type EntityId,
  type GameRef,
  type GameType,
  type CorrectionError,
} from './night';
import { GAME_NAMES } from './results';
import { $, escapeHtml, currentScreen, onScreenChange, dataNum, toast } from './ui';

export { TEAM_COLORS, TEAM_NAME_DEFAULTS } from './night';

/** Tonight's night. The only instance; the setup screen changes it through
 *  the night's operations. Loading or starting a new night refills this same
 *  object, so every module's reference stays good. */
export const night = newNight();

// ---------- the saved night ----------

const STORAGE_KEY = 'showdown-night';

/** Save the night, overwriting the one saved night. Called after every
 *  change. Storage can be unavailable (private windows, blocked site data);
 *  the night then simply lives for this page only. */
export function saveNight(): void {
  try {
    localStorage.setItem(STORAGE_KEY, serialize(night));
  } catch {
    // not saved; play carries on
  }
}

/** Replace tonight with the saved night, or a fresh one if there's none or it
 *  can't be read. */
export function loadNight(): void {
  let data: string | null = null;
  try {
    data = localStorage.getItem(STORAGE_KEY);
  } catch {
    // no storage: start fresh
  }
  Object.assign(night, deserialize(data));
}

/** Clear tonight's entities, games and standings, and save that. */
export function startNewNight(): void {
  Object.assign(night, newNight());
  saveNight();
}

/** How many turns have been confirmed in the game in progress, in total. */
export function turnsTaken(): number {
  return entitiesOf(night).reduce((sum, e) => sum + turnsOf(night, e.id), 0);
}

/** Read-only view of the night in the old shape. Positional: `scores[i]` is
 *  the game score of `entities()[i]` in the game in progress. Write through
 *  the night, never through this. */
export const state = {
  get mode(): Mode {
    return night.mode;
  },
  get teamCount(): number {
    return night.teams.length;
  },
  /** Names only, for Mafia's pre-filled player list. */
  get ffaPlayers(): { name: string }[] {
    return night.players.filter((p) => !p.left).map((p) => ({ name: p.name }));
  },
  get scores(): number[] {
    return entitiesOf(night).map((e) => gameScoreOf(night, e.id));
  },
};

/** The current scoring units: teams, or individual players in free-for-all. */
export function entities(): Entity[] {
  return entitiesOf(night).map((e) => ({ name: e.name, color: e.color }));
}

/** True while the host is holding "This game" to see the standings. */
let peeking = false;

/** The game's own screens are up (not Home, and not Mafia, which isn't a game
 *  in the night). */
function inGame(): boolean {
  const s = currentScreen();
  return !!gameInProgress(night) && s !== 'screen-home' && s !== 'screen-mafia';
}

/** A scoreboard chip. With an `id`, double-clicking it starts a correction. */
function chip(color: string, name: string, value: number, place?: number, id?: EntityId): string {
  return (
    `<div class="score-chip"${id === undefined ? '' : ` data-id="${id}"`}>` +
    (place === undefined ? '' : `<span class="place mono">${place}</span>`) +
    `<span class="swatch" style="background:${color}"></span>` +
    `<span class="name">${escapeHtml(name)}</span>` +
    `<span class="val mono">${value}</span></div>`
  );
}

function standingsChips(editable = false): string {
  return standings(night)
    .map((s) => chip(s.entity.color, s.entity.name, s.total, s.place, editable ? s.entity.id : undefined))
    .join('');
}

// ---------- corrections ----------

const ERROR_TEXT: Record<CorrectionError, (type: GameType) => string> = {
  'not-whole': () => 'Scores must be whole numbers.',
  negative: (type) => `${GAME_NAMES[type]} scores can&rsquo;t go below 0.`,
  'no-game': () => 'That game is no longer there.',
  'not-in-game': () => 'They didn&rsquo;t play that game.',
};

/** Parse what the host typed. Anything but an optional minus and digits is
 *  not a whole number (NaN is refused by the night as not whole). */
function parseScore(text: string): number {
  const t = text.trim();
  return /^-?\d+$/.test(t) ? Number(t) : NaN;
}

/** Try a correction; on refusal show why and leave everything as it was. */
function correct(ref: GameRef, id: EntityId, text: string): boolean {
  const type = ref === 'current' ? gameInProgress(night)?.type : finishedGames(night)[ref]?.type;
  const err = setGameScore(night, ref, id, parseScore(text));
  if (err) {
    toast(ERROR_TEXT[err](type ?? 'emoji'));
    return false;
  }
  return true;
}

/** Turn a game-score chip's number into a preselected input. Enter saves;
 *  Esc or clicking away cancels. */
function editChip(chipEl: HTMLElement, id: EntityId): void {
  const val = chipEl.querySelector<HTMLElement>('.val');
  if (!val || val.querySelector('input')) return;
  val.innerHTML = `<input class="score-input mono" inputmode="numeric" value="${val.textContent}" aria-label="Game score">`;
  const input = val.querySelector('input')!;
  input.focus();
  input.select();
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      if (correct('current', id, input.value)) renderScoreboard();
    } else if (e.key === 'Escape') {
      renderScoreboard();
    }
  });
  input.addEventListener('blur', () => renderScoreboard());
}

/** The entity whose finished games the corrections panel lists, if open. */
let panelFor: EntityId | null = null;

function openPanel(id: EntityId): void {
  panelFor = id;
  renderPanel();
}

/** Open an entity's finished games for correction, e.g. from the Left list. */
export function openCorrections(id: EntityId): void {
  openPanel(id);
}

function closePanel(): void {
  panelFor = null;
  renderPanel();
}

/** The panel under the row on Home: one entity's finished games tonight,
 *  each with its game score editable and the placement points it earned. */
function renderPanel(): void {
  const panel = $('correctPanel');
  // Left entities stay correctable, so look among everyone.
  const entity = allEntitiesOf(night).find((e) => e.id === panelFor);
  if (!entity || currentScreen() !== 'screen-home') {
    panelFor = null;
    panel.hidden = true;
    panel.innerHTML = '';
    return;
  }
  const games = finishedGames(night)
    .map((g, i) => ({ g, i }))
    .filter(({ g }) => g.entityIds.includes(entity.id));

  panel.hidden = false;
  panel.innerHTML =
    '<div class="panel-head">' +
    `<span class="swatch" style="background:${entity.color}"></span>` +
    `<strong>${escapeHtml(entity.name)}</strong><span class="panel-sub">tonight&rsquo;s games</span>` +
    '<button class="panel-x" id="panelClose" aria-label="Close">&times;</button></div>' +
    (games.length
      ? '<div class="panel-games">' +
        games
          .map(
            ({ g, i }, k) =>
              '<label class="panel-game">' +
              `<span class="panel-name"><span class="mono">${k + 1}</span> ${GAME_NAMES[g.type]}</span>` +
              `<input class="score-input mono" data-game="${i}" inputmode="numeric" value="${g.scores[entity.id] ?? 0}">` +
              `<span class="panel-earned mono">+${earnedIn(night, i)[entity.id] ?? 0}</span></label>`,
          )
          .join('') +
        '</div><p class="panel-hint">Type a game score and press Enter.</p>'
      : '<p class="panel-hint">No finished games yet.</p>');

  $('panelClose').addEventListener('click', closePanel);
  panel.querySelectorAll<HTMLInputElement>('input[data-game]').forEach((input) => {
    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      if (!correct(dataNum(input, 'game'), entity.id, input.value)) return;
      renderScoreboard();
      renderPanel();
      panel.querySelector<HTMLInputElement>(`input[data-game="${input.dataset.game}"]`)?.focus();
    });
  });
}

/** Redraw the row. Every change to the night ends in a redraw, so this is
 *  also where the night is saved. */
export function renderScoreboard(): void {
  saveNight();
  const row = $('scoreRow');
  $('endGameBtn').hidden = !gameInProgress(night);
  if (!night.mode) {
    row.innerHTML = '';
    return;
  }

  if (!inGame()) {
    peeking = false;
    // Finished games are corrected from Home only.
    const onHome = currentScreen() === 'screen-home';
    row.innerHTML = '<span class="score-label">Tonight</span>' + standingsChips(onHome);
    if (onHome) {
      row.querySelectorAll<HTMLElement>('.score-chip').forEach((c) => {
        c.addEventListener('dblclick', () => openPanel(dataNum(c, 'id')));
      });
    }
    return;
  }

  row.innerHTML =
    `<button class="score-label hold${peeking ? ' peeking' : ''}" id="scoreHold" ` +
    'title="Hold to see tonight&rsquo;s standings">' +
    `${peeking ? 'Tonight' : 'This game'}</button>` +
    (peeking
      ? standingsChips()
      : entitiesOf(night)
          .map((e) => chip(e.color, e.name, gameScoreOf(night, e.id), undefined, e.id))
          .join(''));

  $('scoreHold').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    peeking = true;
    renderScoreboard();
  });
  if (!peeking) {
    row.querySelectorAll<HTMLElement>('.score-chip').forEach((c) => {
      c.addEventListener('dblclick', () => editChip(c, dataNum(c, 'id')));
    });
  }
}

/** Wire the listeners that live for the whole session. */
export function initScoreboard(): void {
  // Release anywhere - the label is redrawn under the pointer, and the host
  // may drag off it - snaps the row back to this game.
  const release = () => {
    if (!peeking) return;
    peeking = false;
    renderScoreboard();
  };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
  window.addEventListener('blur', release);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panelFor !== null) closePanel();
  });
  onScreenChange(() => {
    renderScoreboard();
    renderPanel();
  });
}

/** Record a confirmed turn for the entity at index `i` (even a 0-point one). */
export function recordTurn(i: number): void {
  const e = entitiesOf(night)[i];
  if (e) confirmTurn(night, e.id);
  saveNight();
}

/** Index of the entity whose turn is next (fewest turns), 0 if none. */
export function nextTurnIndex(): number {
  const id = nextTurn(night);
  return Math.max(0, entitiesOf(night).findIndex((e) => e.id === id));
}

/** Add (or, with a negative value, subtract) points for the entity at index
 *  `i`, in the game in progress. */
export function award(i: number, pts: number): void {
  const e = entitiesOf(night)[i];
  if (!e) return;
  awardInNight(night, e.id, pts);
  renderScoreboard();
}
