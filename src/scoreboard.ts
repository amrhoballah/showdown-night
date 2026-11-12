/** Tonight's night and the sticky scoreboard row.
 *
 *  The night itself - entities, the game in progress, finished games,
 *  standings - is the pure Night module (`night.ts`). This module holds the
 *  one instance of it, saves it to localStorage after every change, and draws
 *  the row. Game modules change the night through its operations, then call
 *  `renderScoreboard()`, which redraws and saves. Mafia is the deliberate
 *  exception: it tracks its own players and win condition and never touches
 *  the night's scores.
 *
 *  The row shows the game in progress's game scores under "This game" while
 *  its screens are up. Holding that label shows the night standings under
 *  "Tonight" until release. Everywhere else (Home, Mafia) it shows the
 *  standings.
 */

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
  serialize,
  deserialize,
  type EntityId,
  type GameRef,
  type GameType,
  type CorrectionError,
} from './night';
import { GAME_NAMES } from './results';
import { $, escapeHtml, currentScreen, onScreenChange, dataNum, toast } from './ui';


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

/** True while the host is holding "This game" to see the standings. */
let peeking = false;

/** The game's own screens are up (not Home, and not Mafia, which isn't a game
 *  in the night). */
function inGame(): boolean {
  const s = currentScreen();
  return !!gameInProgress(night) && s !== 'screen-home' && s !== 'screen-mafia';
}

/** A scoreboard chip. With an `id` it is correctable: focusable, and opened
 *  by double-click, Enter / F2, or a tap on a touchscreen (see `onCorrect`). */
function chip(color: string, name: string, value: number, place?: number, id?: EntityId): string {
  return (
    `<div class="score-chip"${
      id === undefined
        ? ''
        : ` data-id="${id}" tabindex="0" role="button" title="Double-click, Enter or tap to correct"`
    }>` +
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

/** Open a correction from `el` by double-click (mouse), Enter or F2
 *  (keyboard), or a single tap (touch, which can't reliably double-click).
 *  Events from controls inside `el`, like a Back button, are left alone. */
export function onCorrect(el: HTMLElement, open: () => void): void {
  const fromInside = (t: EventTarget | null) =>
    t !== el && t instanceof Element && !!t.closest('button, input');
  el.addEventListener('dblclick', (e) => {
    if (!fromInside(e.target)) open();
  });
  el.addEventListener('keydown', (e) => {
    if (e.target !== el || (e.key !== 'Enter' && e.key !== 'F2')) return;
    e.preventDefault();
    open();
  });
  // Assistive tech activates role="button" with a synthesized click, which
  // has detail 0; mouse and touch clicks count from 1, so they don't open.
  el.addEventListener('click', (e) => {
    if (e.detail === 0 && !fromInside(e.target)) open();
  });
  el.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'touch' && !fromInside(e.target)) open();
  });
}

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
  input.addEventListener('blur', () => {
    if (!rendering) renderScoreboard();
  });
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
  // The row is rebuilt from scratch, so remember what had keyboard focus in
  // it (the hold button, or a chip or its open editor) and put focus back.
  const active = document.activeElement;
  const focusSel = !(active instanceof HTMLElement) || !row.contains(active)
    ? null
    : active.id === 'scoreHold'
      ? '#scoreHold'
      : active.closest<HTMLElement>('.score-chip[data-id]')
        ? `.score-chip[data-id="${active.closest<HTMLElement>('.score-chip[data-id]')!.dataset.id}"]`
        : null;
  const refocus = () => {
    if (focusSel) row.querySelector<HTMLElement>(focusSel)?.focus();
  };
  $('endGameBtn').hidden = !gameInProgress(night);
  if (!night.mode) {
    row.innerHTML = '';
    return;
  }

  if (!inGame()) {
    peeking = false;
    // Finished games are corrected from Home only.
    const onHome = currentScreen() === 'screen-home';
    setRow(row, '<span class="score-label">Tonight</span>' + standingsChips(onHome));
    if (onHome) {
      row.querySelectorAll<HTMLElement>('.score-chip[data-id]').forEach((c) => {
        onCorrect(c, () => openPanel(dataNum(c, 'id')));
      });
    }
    refocus();
    return;
  }

  setRow(
    row,
    `<button class="score-label hold${peeking ? ' peeking' : ''}" id="scoreHold" ` +
    'title="Hold to see tonight&rsquo;s standings">' +
    `${peeking ? 'Tonight' : 'This game'}</button>` +
    (peeking
      ? standingsChips()
      : entitiesOf(night)
          .map((e) => chip(e.color, e.name, gameScoreOf(night, e.id), undefined, e.id))
          .join('')),
  );

  const hold = $('scoreHold');
  hold.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    peeking = true;
    renderScoreboard();
  });
  // Keyboard hold: Space or Enter down peeks, releasing it (keyup, in
  // initScoreboard) or moving focus away snaps back. Key repeat is ignored.
  hold.addEventListener('keydown', (e) => {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    e.preventDefault();
    if (e.repeat || peeking) return;
    peeking = true;
    renderScoreboard();
  });
  hold.addEventListener('blur', () => {
    if (!rendering) release();
  });
  if (!peeking) {
    row.querySelectorAll<HTMLElement>('.score-chip[data-id]').forEach((c) => {
      onCorrect(c, () => editChip(c, dataNum(c, 'id')));
    });
  }
  refocus();
}

/** True while the row's markup is being replaced, so the blur that removing
 *  a focused element can fire isn't mistaken for the host moving away. */
let rendering = false;

function setRow(row: HTMLElement, html: string): void {
  rendering = true;
  try {
    row.innerHTML = html;
  } finally {
    rendering = false;
  }
}

/** Snap a peek back to this game. */
function release(): void {
  if (!peeking) return;
  peeking = false;
  renderScoreboard();
}

/** Wire the listeners that live for the whole session. */
export function initScoreboard(): void {
  // Release anywhere - the label is redrawn under the pointer, and the host
  // may drag off it - snaps the row back to this game.
  window.addEventListener('pointerup', release);
  window.addEventListener('keyup', (e) => {
    if (e.key === ' ' || e.key === 'Enter') release();
  });
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
