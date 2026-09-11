/** The home screen: choosing teams vs free-for-all, and naming everyone. */

import {
  state,
  entities,
  renderScoreboard,
  TEAM_COLORS,
  TEAM_NAME_DEFAULTS,
} from './scoreboard';
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
      (m.key === 'ffa' && state.mode === 'ffa') ||
      (m.key !== 'ffa' && state.mode === 'teams' && state.teamCount === m.teams);
    return (
      `<button class="mode-card${active ? ' active' : ''}" data-key="${m.key}">` +
      `<b>${m.label}</b><span>${m.sub}</span></button>`
    );
  }).join('');
  onClickAll(grid, '.mode-card', (btn) => selectMode(btn.getAttribute('data-key')!));
}

export function selectMode(key: string): void {
  const m = MODES.find((x) => x.key === key)!;
  if (m.key === 'ffa') {
    state.mode = 'ffa';
  } else {
    state.mode = 'teams';
    state.teamCount = m.teams;
    state.teamNames = Array.from(
      { length: m.teams },
      (_, i) => state.teamNames[i] || TEAM_NAME_DEFAULTS[i % 4],
    );
  }
  state.scores = [];
  renderModeGrid();
  renderSetupArea();
  renderScoreboard();
}

export function renderSetupArea(): void {
  const teamArea = $('teamSetupArea');
  const ffaArea = $('ffaSetupArea');

  if (state.mode === 'teams') {
    teamArea.hidden = false;
    ffaArea.hidden = true;
    teamArea.innerHTML = state.teamNames
      .map(
        (n, i) =>
          `<div class="team-row"><span class="swatch" style="background:${TEAM_COLORS[i % 4]}"></span>` +
          `<input type="text" id="teamName${i}" data-i="${i}" value="${escapeHtml(n)}" maxlength="24"></div>`,
      )
      .join('');
    teamArea.querySelectorAll<HTMLInputElement>('input').forEach((inp) => {
      inp.addEventListener('input', () => {
        state.teamNames[dataNum(inp, 'i')] = inp.value || 'Team';
        renderScoreboard();
      });
    });
    return;
  }

  if (state.mode === 'ffa') {
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
  list.innerHTML = state.ffaPlayers
    .map(
      (p, i) =>
        `<span class="ffa-chip"><span class="swatch" style="width:14px;height:14px;border-radius:50%;` +
        `background:${TEAM_COLORS[i % 4]};display:inline-block;"></span>${escapeHtml(p.name)}` +
        `<button data-i="${i}" aria-label="Remove ${escapeHtml(p.name)}">&times;</button></span>`,
    )
    .join('');
  onClickAll(list, 'button', (btn) => {
    state.ffaPlayers.splice(dataNum(btn, 'i'), 1);
    state.scores = [];
    renderFfaList();
    renderScoreboard();
  });
}

function addFfaPlayer(): void {
  const inp = $('ffaInput') as HTMLInputElement;
  const v = inp.value.trim();
  if (!v) return;
  state.ffaPlayers.push({ name: v });
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
  return !!state.mode && entities().length > 0;
}

export function initSetup(): void {
  $('ffaAddBtn').addEventListener('click', addFfaPlayer);
  $('ffaInput').addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter') {
      e.preventDefault();
      addFfaPlayer();
    }
  });
  selectMode('t2');
  renderModeGrid();
  renderSetupArea();
  renderScoreboard();
}
