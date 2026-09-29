/** The home screen: choosing teams vs free-for-all, and naming everyone.
 *
 *  Before anything has been played, setup is free. From the first finished
 *  game until New night, the mode and team count are locked; latecomers join
 *  at 0, and someone who goes home is marked Left (keeping their results) and
 *  can come Back. Adding and leaving happen only between games. Renaming is
 *  allowed any time.
 */

import { night, renderScoreboard, openCorrections } from './scoreboard';
import {
  entitiesOf,
  leftOf,
  setTeams,
  setFreeForAll,
  addPlayer,
  addTeam,
  removePlayer,
  rename,
  leave,
  back,
  setupLocked,
  finishedGames,
  gameInProgress,
  type EntityId,
} from './night';
import { $, escapeHtml, onClickAll, dataNum, confirmBox } from './ui';

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

/** What "yes" does when a leave would end the night: start a new one. Set by
 *  the entry point, which owns New night. */
let newNightHandler: () => void = () => {};

export function onNightCantGoOn(fn: () => void): void {
  newNightHandler = fn;
}

/** Something has been played tonight, so people join and leave rather than
 *  being added and removed freely. */
function nightUnderway(): boolean {
  return finishedGames(night).length > 0;
}

function inGame(): boolean {
  return !!gameInProgress(night);
}

export function renderModeGrid(): void {
  const grid = $('modeGrid');
  const locked = setupLocked(night);
  grid.innerHTML = MODES.map((m) => {
    const active =
      (m.key === 'ffa' && night.mode === 'ffa') ||
      (m.key !== 'ffa' && night.mode === 'teams' && night.teams.length === m.teams);
    return (
      `<button class="mode-card${active ? ' active' : ''}" data-key="${m.key}"${locked ? ' disabled' : ''}>` +
      `<b>${m.label}</b><span>${m.sub}</span></button>`
    );
  }).join('');
  onClickAll(grid, '.mode-card:not(:disabled)', (btn) => selectMode(btn.getAttribute('data-key')!));

  const note = $('setupNote');
  note.textContent = nightUnderway()
    ? inGame()
      ? 'Start a new night to change this. Adding and leaving happen between games.'
      : 'Start a new night to change this.'
    : inGame()
      ? 'End the game in progress to change this.'
      : '';
  note.hidden = !note.textContent;
}

export function selectMode(key: string): void {
  const m = MODES.find((x) => x.key === key)!;
  const ok = m.key === 'ffa' ? setFreeForAll(night) : setTeams(night, m.teams);
  if (!ok) return;
  refreshAfterChange();
}

function refreshAfterChange(): void {
  renderModeGrid();
  renderSetupArea();
  renderScoreboard();
}

/** A Left button, offered between games once the night is underway. */
function leftButton(id: EntityId, name: string): string {
  return nightUnderway() && !inGame()
    ? `<button class="left-btn" data-leave="${id}" aria-label="${escapeHtml(name)} has left">Left</button>`
    : '';
}

export function renderSetupArea(): void {
  const teamArea = $('teamSetupArea');
  const ffaArea = $('ffaSetupArea');

  if (night.mode === 'teams') {
    teamArea.hidden = false;
    ffaArea.hidden = true;
    const canAdd = nightUnderway() && !inGame() && night.teams.length < 4;
    teamArea.innerHTML =
      entitiesOf(night)
        .map(
          (t, i) =>
            `<div class="team-row"><span class="swatch" style="background:${t.color}"></span>` +
            `<input type="text" id="teamName${i}" data-id="${t.id}" value="${escapeHtml(t.name)}" maxlength="24">` +
            leftButton(t.id, t.name) +
            '</div>',
        )
        .join('') +
      (canAdd ? '<button class="btn ghost add-team-btn" id="addTeamBtn">+ Add team</button>' : '');
    teamArea.querySelectorAll<HTMLInputElement>('input').forEach((inp) => {
      inp.addEventListener('input', () => {
        rename(night, dataNum(inp, 'id'), inp.value || 'Team');
        renderScoreboard();
      });
    });
    wireLeaveButtons(teamArea);
    document.getElementById('addTeamBtn')?.addEventListener('click', () => {
      if (addTeam(night)) refreshAfterChange();
    });
  } else if (night.mode === 'ffa') {
    teamArea.hidden = true;
    ffaArea.hidden = false;
    renderFfaList();
  } else {
    teamArea.hidden = true;
    ffaArea.hidden = true;
  }
  renderLeftList();
}

function renderFfaList(): void {
  const list = $('ffaList');
  list.innerHTML = entitiesOf(night)
    .map((p) => {
      // Before anything is played, × removes a player; after, they're marked Left.
      const control = nightUnderway()
        ? leftButton(p.id, p.name)
        : inGame()
          ? ''
          : `<button data-remove="${p.id}" aria-label="Remove ${escapeHtml(p.name)}">&times;</button>`;
      return (
        `<span class="ffa-chip"><span class="swatch" style="width:14px;height:14px;border-radius:50%;` +
        `background:${p.color};display:inline-block;"></span>${escapeHtml(p.name)}${control}</span>`
      );
    })
    .join('');
  onClickAll(list, 'button[data-remove]', (btn) => {
    if (removePlayer(night, dataNum(btn, 'remove'))) refreshAfterChange();
  });
  wireLeaveButtons(list);

  const input = $('ffaInput') as HTMLInputElement;
  input.disabled = inGame();
  input.placeholder = inGame()
    ? 'Players join between games'
    : 'Type a name and press Enter…';
  ($('ffaAddBtn') as HTMLButtonElement).disabled = inGame();
}

function wireLeaveButtons(root: HTMLElement): void {
  onClickAll(root, 'button[data-leave]', (btn) => markLeft(dataNum(btn, 'leave')));
}

/** Mark an entity Left. If that would leave fewer than 2, ask instead
 *  whether to end the night and start a new one. */
async function markLeft(id: EntityId): Promise<void> {
  const refusal = leave(night, id);
  if (refusal === 'would-end-night') {
    const rest = entitiesOf(night).filter((e) => e.id !== id);
    const who = rest.map((e) => escapeHtml(e.name)).join(' &amp; ') || 'nobody';
    const yes = await confirmBox(
      `Only ${who} would be left, so the night can&rsquo;t go on. End it and start a new night?`,
      'Start a new night',
    );
    if (yes) newNightHandler();
    return;
  }
  if (!refusal) refreshAfterChange();
}

/** Who has left, each with Back. Double-clicking one opens its finished
 *  games for correction, as a Tonight chip does. */
function renderLeftList(): void {
  const area = $('leftArea');
  const gone = leftOf(night);
  area.hidden = gone.length === 0;
  if (!gone.length) {
    area.innerHTML = '';
    return;
  }
  area.innerHTML =
    '<h4>Left tonight</h4><div class="left-list">' +
    gone
      .map(
        (e) =>
          `<span class="left-chip" data-id="${e.id}" title="Double-click to correct their games">` +
          `<span class="swatch" style="background:${e.color}"></span>${escapeHtml(e.name)}` +
          (inGame() ? '' : `<button class="back-btn" data-back="${e.id}">Back</button>`) +
          '</span>',
      )
      .join('') +
    '</div>';
  onClickAll(area, 'button[data-back]', (btn) => {
    if (!back(night, dataNum(btn, 'back'))) refreshAfterChange();
  });
  area.querySelectorAll<HTMLElement>('.left-chip').forEach((chip) => {
    chip.addEventListener('dblclick', () => openCorrections(dataNum(chip, 'id')));
  });
}

function addFfaPlayer(): void {
  const inp = $('ffaInput') as HTMLInputElement;
  const v = inp.value.trim();
  if (!v || !addPlayer(night, v)) return;
  inp.value = '';
  refreshAfterChange();
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
  refreshAfterChange();
}
