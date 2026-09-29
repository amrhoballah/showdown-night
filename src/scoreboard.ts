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
  gameInProgress,
  gameScoreOf,
  standings,
  award as awardInNight,
  type Mode,
} from './night';
import { $, escapeHtml, currentScreen, onScreenChange } from './ui';

export { TEAM_COLORS, TEAM_NAME_DEFAULTS } from './night';

/** Tonight's night. The only instance; the setup screen changes it through
 *  the night's operations. */
export const night = newNight();

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
    return night.players.map((p) => ({ name: p.name }));
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

function chip(color: string, name: string, value: number, place?: number): string {
  return (
    '<div class="score-chip">' +
    (place === undefined ? '' : `<span class="place mono">${place}</span>`) +
    `<span class="swatch" style="background:${color}"></span>` +
    `<span class="name">${escapeHtml(name)}</span>` +
    `<span class="val mono">${value}</span></div>`
  );
}

function standingsChips(): string {
  return standings(night)
    .map((s) => chip(s.entity.color, s.entity.name, s.total, s.place))
    .join('');
}

export function renderScoreboard(): void {
  const row = $('scoreRow');
  $('endGameBtn').hidden = !gameInProgress(night);
  if (!night.mode) {
    row.innerHTML = '';
    return;
  }

  if (!inGame()) {
    peeking = false;
    row.innerHTML = '<span class="score-label">Tonight</span>' + standingsChips();
    return;
  }

  row.innerHTML =
    `<button class="score-label hold${peeking ? ' peeking' : ''}" id="scoreHold" ` +
    'title="Hold to see tonight&rsquo;s standings">' +
    `${peeking ? 'Tonight' : 'This game'}</button>` +
    (peeking
      ? standingsChips()
      : entitiesOf(night)
          .map((e) => chip(e.color, e.name, gameScoreOf(night, e.id)))
          .join(''));

  $('scoreHold').addEventListener('pointerdown', (e) => {
    e.preventDefault();
    peeking = true;
    renderScoreboard();
  });
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
  onScreenChange(renderScoreboard);
}

/** Add (or, with a negative value, subtract) points for the entity at index
 *  `i`, in the game in progress. */
export function award(i: number, pts: number): void {
  const e = entitiesOf(night)[i];
  if (!e) return;
  awardInNight(night, e.id, pts);
  renderScoreboard();
}
