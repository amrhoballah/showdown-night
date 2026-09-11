/** Who is playing and what they have scored.
 *
 *  Every game awards points through `award()`, so the sticky scoreboard at the
 *  top of the screen is the single running total for the whole night. Mafia is
 *  the deliberate exception - it tracks its own players and win condition and
 *  never touches these scores.
 */

import type { Entity } from './types';
import { $, escapeHtml } from './ui';

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

export interface AppState {
  mode: Mode;
  teamCount: number;
  teamNames: string[];
  ffaPlayers: { name: string }[];
  scores: number[];
}

export const state: AppState = {
  mode: null,
  teamCount: 2,
  teamNames: TEAM_NAME_DEFAULTS.slice(0, 2),
  ffaPlayers: [],
  scores: [],
};

/** The current scoring units: teams, or individual players in free-for-all. */
export function entities(): Entity[] {
  if (state.mode === 'ffa') {
    return state.ffaPlayers.map((p, i) => ({ name: p.name, color: TEAM_COLORS[i % 4] }));
  }
  return state.teamNames.map((n, i) => ({ name: n, color: TEAM_COLORS[i % 4] }));
}

/** Keep the scores array the same length as the entity list. */
export function ensureScores(): void {
  const n = entities().length;
  while (state.scores.length < n) state.scores.push(0);
  state.scores.length = n;
}

export function renderScoreboard(): void {
  const row = $('scoreRow');
  if (!state.mode) {
    row.innerHTML = '';
    return;
  }
  ensureScores();
  row.innerHTML = entities()
    .map(
      (e, i) =>
        `<div class="score-chip"><span class="swatch" style="background:${e.color}"></span>` +
        `<span class="name">${escapeHtml(e.name)}</span>` +
        `<span class="val mono">${state.scores[i]}</span></div>`,
    )
    .join('');
}

/** Add (or, with a negative value, subtract) points for one entity. */
export function award(i: number, pts: number): void {
  ensureScores();
  state.scores[i] = (state.scores[i] || 0) + pts;
  renderScoreboard();
}
