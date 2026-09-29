/** The sticky scoreboard, and the positional adapters over the night.
 *
 *  The night itself (entities with stable ids, their scores) lives in
 *  `night.ts`. The functions here keep the old index-based interface the game
 *  modules call - `entities()`, `award(i, pts)`, `state.scores[i]` - until
 *  they move onto the night directly. Mafia is the deliberate exception: it
 *  tracks its own players and win condition and never touches these scores.
 */

import type { Entity } from './types';
import { newNight, entitiesOf, scoreOf, addPoints, type Mode } from './night';
import { $, escapeHtml } from './ui';

export { TEAM_COLORS, TEAM_NAME_DEFAULTS } from './night';

/** Tonight's night. The only instance; the setup screen changes it through
 *  the night's operations. */
export const night = newNight();

/** Read-only view of the night in the old shape. Positional: `scores[i]` is
 *  the score of `entities()[i]`. Write through the night, never through this. */
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
    return entitiesOf(night).map((e) => scoreOf(night, e.id));
  },
};

/** The current scoring units: teams, or individual players in free-for-all. */
export function entities(): Entity[] {
  return entitiesOf(night).map((e) => ({ name: e.name, color: e.color }));
}

export function renderScoreboard(): void {
  const row = $('scoreRow');
  if (!night.mode) {
    row.innerHTML = '';
    return;
  }
  row.innerHTML = entitiesOf(night)
    .map(
      (e) =>
        `<div class="score-chip"><span class="swatch" style="background:${e.color}"></span>` +
        `<span class="name">${escapeHtml(e.name)}</span>` +
        `<span class="val mono">${scoreOf(night, e.id)}</span></div>`,
    )
    .join('');
}

/** Add (or, with a negative value, subtract) points for the entity at index `i`. */
export function award(i: number, pts: number): void {
  const e = entitiesOf(night)[i];
  if (!e) return;
  addPoints(night, e.id, pts);
  renderScoreboard();
}
