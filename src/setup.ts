/** The home screen: choosing teams vs free-for-all, and naming everyone. */

import { night, renderScoreboard } from './scoreboard';
import {
  entitiesOf,
  setTeams,
  setFreeForAll,
  addPlayer,
  removePlayer,
  rename,
} from './night';
import { $, escapeHtml, onClickAll, dataNum } from './ui';

interface ModeOption {
  key: string;
  teams: number;
  label: string;
  sub: string;
}

const MODES: ModeOption[] = [
  { key: 't2', teams: 2, label: '2 teams', sub: '6 vs 6, head to head' },
  { key: 't3', teams: 3, label: '3 teams', sub: 'groups of 4' },
  { key: 't4', teams: 4, label: '4 teams', sub: 'groups of 3' },
  { key: 'ffa', teams: 0, label: 'Free-for-all', sub: 'everyone for themselves' },
];

export function renderModeGrid(): void {
  const grid = $('modeGrid');
  grid.innerHTML = MODES.map((m) => {
    const active =
      (m.key === 'ffa' && night.mode === 'ffa') ||
      (m.key !== 'ffa' && night.mode === 'teams' && night.teams.length === m.teams);
    return (
      `<button class="mode-card${active ? ' active' : ''}" data-key="${m.key}">` +
      `<b>${m.label}</b><span>${m.sub}</span></button>`
    );
  }).join('');
  onClickAll(grid, '.mode-card', (btn) => selectMode(btn.getAttribute('data-key')!));
}

export function selectMode(key: string): void {
  const m = MODES.find((x) => x.key === key)!;
  if (m.key === 'ffa') setFreeForAll(night);
  else setTeams(night, m.teams);
  renderModeGrid();
  renderSetupArea();
  renderScoreboard();
}

export function renderSetupArea(): void {
  const teamArea = $('teamSetupArea');
  const ffaArea = $('ffaSetupArea');

  if (night.mode === 'teams') {
    teamArea.hidden = false;
    ffaArea.hidden = true;
    teamArea.innerHTML = night.teams
      .map(
        (t, i) =>
          `<div class="team-row"><span class="swatch" style="background:${t.color}"></span>` +
          `<input type="text" id="teamName${i}" data-id="${t.id}" value="${escapeHtml(t.name)}" maxlength="24"></div>`,
      )
      .join('');
    teamArea.querySelectorAll<HTMLInputElement>('input').forEach((inp) => {
      inp.addEventListener('input', () => {
        rename(night, dataNum(inp, 'id'), inp.value || 'Team');
        renderScoreboard();
      });
    });
    return;
  }

  if (night.mode === 'ffa') {
    teamArea.hidden = true;
    ffaArea.hidden = false;
    renderFfaList();
    return;
  }

  teamArea.hidden = true;
  ffaArea.hidden = true;
}

function renderFfaList(): void {
  const list = $('ffaList');
  list.innerHTML = night.players
    .map(
      (p) =>
        `<span class="ffa-chip"><span class="swatch" style="width:14px;height:14px;border-radius:50%;` +
        `background:${p.color};display:inline-block;"></span>${escapeHtml(p.name)}` +
        `<button data-id="${p.id}" aria-label="Remove ${escapeHtml(p.name)}">&times;</button></span>`,
    )
    .join('');
  onClickAll(list, 'button', (btn) => {
    removePlayer(night, dataNum(btn, 'id'));
    renderFfaList();
    renderScoreboard();
  });
}

function addFfaPlayer(): void {
  const inp = $('ffaInput') as HTMLInputElement;
  const v = inp.value.trim();
  if (!v) return;
  addPlayer(night, v);
  inp.value = '';
  renderFfaList();
  renderScoreboard();
}

/** Nudge the user toward picking a mode before launching a scoring game. */
export function flashNeedMode(): void {
  const grid = $('modeGrid');
  grid.scrollIntoView({ behavior: 'smooth', block: 'center' });
  grid.style.outline = '2px solid var(--alert)';
  setTimeout(() => {
    grid.style.outline = '';
  }, 900);
}

/** True when there is at least one team or player to award points to. */
export function hasPlayers(): boolean {
  return entitiesOf(night).length > 0;
}

export function initSetup(): void {
  $('ffaAddBtn').addEventListener('click', addFfaPlayer);
  $('ffaInput').addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter') {
      e.preventDefault();
      addFfaPlayer();
    }
  });
  refreshSetup();
}

/** Redraw the setup from the night. A night with no mode yet (a fresh one)
 *  starts as two teams; a restored night keeps its own setup, since choosing
 *  a mode would clear it. */
export function refreshSetup(): void {
  if (!night.mode) selectMode('t2');
  renderModeGrid();
  renderSetupArea();
  renderScoreboard();
}
