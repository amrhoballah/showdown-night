/** Game 3 - Mafia, with the screen acting as narrator.
 *
 *  The laptop is passed around once for private role reveals, then the screen
 *  runs every night phase, the day timer, the vote and the win check.
 *
 *  Note: Mafia does NOT use the shared scoreboard. It tracks its own players and
 *  its own win condition, because "points" mean nothing in a social deduction
 *  game. This is intentional, not an oversight.
 */

import type { MafiaPlayer, MafiaRoleName } from '../types';
import { ROLE_INFO } from '../data/mafia';
import { state } from '../scoreboard';
import { $, show, escapeHtml, shuffle, onClickAll, dataNum } from '../ui';

type Phase = 'setup' | 'reveal' | 'roleShown' | 'night' | 'day' | 'vote' | 'over';

interface MafiaState {
  phase: Phase;
  count: number;
  players: MafiaPlayer[];
  revealIdx: number;
  nightStep: number;
  nightTarget: number | null;
  nightSave: number | null;
  nightCheck: number | null;
  dayTimer: number;
  daySeconds: number;
  round: number;
  winner: string;
}

let m: MafiaState | null = null;

function fresh(): MafiaState {
  return {
    phase: 'setup',
    count: 12,
    players: [],
    revealIdx: 0,
    nightStep: 0,
    nightTarget: null,
    nightSave: null,
    nightCheck: null,
    dayTimer: 0,
    daySeconds: 240,
    round: 1,
    winner: '',
  };
}

export function stopMafiaTimer(): void {
  if (m) clearInterval(m.dayTimer);
}

/** Reuse free-for-all names when the user already typed them on the home screen. */
function presetNames(): string[] | null {
  if (state.mode === 'ffa' && state.ffaPlayers.length >= 4) {
    return state.ffaPlayers.map((p) => p.name);
  }
  return null;
}

function splitText(n: number): string {
  const mafia = Math.max(1, Math.floor(n / 4));
  const specials = n >= 8 ? 2 : 1;
  return `${mafia} mafia, ${n >= 8 ? '1 detective and 1 doctor' : '1 detective'}, and ${
    n - mafia - specials
  } civilians.`;
}

function alive(): MafiaPlayer[] {
  return m!.players.filter((p) => p.alive);
}

function playerGrid(clickable: boolean): string {
  return (
    '<div class="pick-grid">' +
    m!.players
      .map((p, i) =>
        p.alive && clickable
          ? `<button class="pick" data-i="${i}">${escapeHtml(p.name)}</button>`
          : `<div class="pick${p.alive ? '' : ' out'}">${escapeHtml(p.name)}</div>`,
      )
      .join('') +
    '</div>'
  );
}

export function renderMafia(): void {
  if (!m) m = fresh();
  const card = $('mafiaCard');

  $('mafiaStatus').textContent =
    m.phase === 'setup' ? '' : `Night/Day ${m.round} · ${alive().length} alive`;

  if (m.phase === 'setup') {
    const preset = presetNames();
    card.innerHTML =
      '<p class="kicker">Mafia &middot; setup</p>' +
      '<h2>How many are playing?</h2>' +
      `<div class="count-row"><button id="mMinus">&minus;</button>` +
      `<span class="n mono" id="mCount">${m.count}</span><button id="mPlus">+</button></div>` +
      `<p class="sub">${splitText(m.count)}</p>` +
      (preset
        ? `<p class="sub" style="color:var(--ink-faint)">Using the ${preset.length} names from your free-for-all setup.</p>`
        : '') +
      '<button class="btn" id="mDeal">Deal roles &amp; start</button>';

    $('mMinus').addEventListener('click', () => {
      m!.count = Math.max(6, m!.count - 1);
      renderMafia();
    });
    $('mPlus').addEventListener('click', () => {
      m!.count = Math.min(16, m!.count + 1);
      renderMafia();
    });
    $('mDeal').addEventListener('click', deal);
    return;
  }

  if (m.phase === 'reveal') {
    const p = m.players[m.revealIdx];
    card.innerHTML =
      `<p class="kicker">Secret roles &middot; ${m.revealIdx + 1} of ${m.players.length}</p>` +
      `<h2>Pass the laptop to ${escapeHtml(p.name)}.</h2>` +
      `<p class="sub">Everyone else: look away. ${escapeHtml(p.name)}, tap below when nobody can see the screen.</p>` +
      `<button class="btn" id="mShowRole">I'm ${escapeHtml(p.name)} &mdash; show my role</button>`;
    $('mShowRole').addEventListener('click', () => {
      m!.phase = 'roleShown';
      renderMafia();
    });
    return;
  }

  if (m.phase === 'roleShown') {
    const pr = m.players[m.revealIdx];
    const info = ROLE_INFO[pr.role];
    const last = m.revealIdx === m.players.length - 1;
    card.innerHTML =
      `<p class="kicker">${escapeHtml(pr.name)}&rsquo;s role</p>` +
      `<div class="role-card"><span class="r ${info.cls}">${info.label}</span>` +
      `<span class="d">${info.desc}</span></div>` +
      `<button class="btn" id="mHideRole">${
        last ? 'Got it &mdash; begin night 1' : 'Hide &amp; pass to the next player'
      }</button>`;
    $('mHideRole').addEventListener('click', () => {
      if (last) {
        m!.phase = 'night';
        m!.nightStep = 0;
      } else {
        m!.revealIdx++;
        m!.phase = 'reveal';
      }
      renderMafia();
    });
    return;
  }

  if (m.phase === 'night') return renderNight();
  if (m.phase === 'day') return renderDay();
  if (m.phase === 'vote') return renderVote();

  // over
  card.innerHTML =
    '<p class="kicker">Game over</p>' +
    `<h2>${escapeHtml(m.winner)}</h2>` +
    '<div class="pick-grid">' +
    m.players
      .map(
        (p) =>
          `<div class="pick${p.alive ? '' : ' out'}">${escapeHtml(p.name)}` +
          `<span class="role">${ROLE_INFO[p.role].label}</span></div>`,
      )
      .join('') +
    '</div>' +
    '<button class="btn" id="mAgain">Play another round</button>';
  $('mAgain').addEventListener('click', () => {
    m = null;
    renderMafia();
  });
}

function deal(): void {
  const preset = presetNames();
  const n = preset ? preset.length : m!.count;
  const mafiaCount = Math.max(1, Math.floor(n / 4));

  const roles: MafiaRoleName[] = [];
  for (let i = 0; i < mafiaCount; i++) roles.push('mafia');
  roles.push('detective');
  if (n >= 8) roles.push('doctor');
  while (roles.length < n) roles.push('civilian');

  const dealt = shuffle(roles);
  m!.players = Array.from({ length: n }, (_, j) => ({
    name: preset ? preset[j] : `Player ${j + 1}`,
    role: dealt[j],
    alive: true,
  }));
  m!.phase = 'reveal';
  m!.revealIdx = 0;
  m!.round = 1;
  renderMafia();
}

/* ---------------- night ---------------- */

interface NightStep {
  key: string;
  text: string;
  pick: keyof Pick<MafiaState, 'nightTarget' | 'nightSave' | 'nightCheck'> | null;
  who?: string;
  skipIf?: () => boolean;
}

const NIGHT_SCRIPT: NightStep[] = [
  {
    key: 'close',
    text: 'Everyone, close your eyes. Keep them closed until I say otherwise.',
    pick: null,
  },
  {
    key: 'mafia',
    text: 'Mafia, open your eyes. Look at each other, then silently agree on one person to eliminate tonight. Point at the screen when you have decided.',
    pick: 'nightTarget',
    who: 'the mafia&rsquo;s target',
  },
  {
    key: 'doctor',
    text: 'Mafia, close your eyes. Doctor, open your eyes and choose one person to protect tonight.',
    pick: 'nightSave',
    who: 'the doctor&rsquo;s save',
    skipIf: () => !m!.players.some((p) => p.role === 'doctor' && p.alive),
  },
  {
    key: 'detect',
    text: 'Doctor, close your eyes. Detective, open your eyes and choose one person to investigate.',
    pick: 'nightCheck',
    who: 'the detective&rsquo;s investigation',
    skipIf: () => !m!.players.some((p) => p.role === 'detective' && p.alive),
  },
  { key: 'result', text: '', pick: null },
];

function renderNight(): void {
  const card = $('mafiaCard');
  while (
    m!.nightStep < NIGHT_SCRIPT.length &&
    NIGHT_SCRIPT[m!.nightStep].skipIf?.()
  ) {
    m!.nightStep++;
  }
  const step = NIGHT_SCRIPT[m!.nightStep];

  if (step.key === 'result') {
    if (m!.nightCheck != null) {
      const checked = m!.players[m!.nightCheck];
      card.innerHTML =
        `<p class="kicker">Night ${m!.round} &middot; private result</p>` +
        '<h2>Pass the laptop to the detective.</h2>' +
        '<p class="sub">Everyone else, eyes closed. Tap only when the detective alone can see the screen.</p>' +
        `<button class="btn" id="mShowCheck">Show the result for ${escapeHtml(checked.name)}</button>`;
      $('mShowCheck').addEventListener('click', () => {
        const isMafia = checked.role === 'mafia';
        card.innerHTML =
          `<p class="kicker">Investigation &middot; ${escapeHtml(checked.name)}</p>` +
          `<div class="role-card"><span class="r ${isMafia ? 'role-mafia' : 'role-town'}">` +
          `${isMafia ? 'MAFIA' : 'NOT MAFIA'}</span>` +
          '<span class="d">Keep this to yourself, or find a way to make the town believe you ' +
          'without getting killed for it.</span></div>' +
          '<button class="btn" id="mHideCheck">Hide &amp; wake the town</button>';
        $('mHideCheck').addEventListener('click', resolveNight);
      });
      return;
    }
    resolveNight();
    return;
  }

  let html = `<p class="kicker">Night ${m!.round}</p><div class="narration">${step.text}</div>`;
  if (step.pick) {
    html += `<p class="sub">Tap ${step.who}.</p>` + playerGrid(true);
    if (step.key !== 'mafia') {
      html += '<button class="kicker-link" id="mSkipPick">Skip &mdash; no choice made</button>';
    }
  } else {
    html += '<button class="btn" id="mNextStep">Continue</button>';
  }
  card.innerHTML = html;

  if (step.pick) {
    onClickAll(card, '.pick[data-i]', (btn) => {
      m![step.pick!] = dataNum(btn, 'i');
      m!.nightStep++;
      renderMafia();
    });
    document.getElementById('mSkipPick')?.addEventListener('click', () => {
      m![step.pick!] = null;
      m!.nightStep++;
      renderMafia();
    });
  } else {
    $('mNextStep').addEventListener('click', () => {
      m!.nightStep++;
      renderMafia();
    });
  }
}

function resolveNight(): void {
  const card = $('mafiaCard');
  let msg: string;

  if (m!.nightTarget != null && m!.nightSave === m!.nightTarget) {
    msg = 'The mafia struck &mdash; but the doctor got there first. Nobody died last night.';
  } else if (m!.nightTarget != null) {
    const victim = m!.players[m!.nightTarget];
    victim.alive = false;
    msg = `${escapeHtml(victim.name)} did not survive the night. They were <strong>${
      ROLE_INFO[victim.role].label
    }</strong>.`;
  } else {
    msg = 'Somehow, nobody died last night.';
  }

  m!.nightTarget = null;
  m!.nightSave = null;
  m!.nightCheck = null;

  const over = checkWin();
  card.innerHTML =
    '<p class="kicker">Everyone, open your eyes</p>' +
    `<div class="narration">${msg}</div>` +
    `<button class="btn" id="mToDay">${
      over ? 'See the result' : 'Start the day &mdash; 4 minutes'
    }</button>`;

  $('mToDay').addEventListener('click', () => {
    if (over) {
      m!.phase = 'over';
    } else {
      m!.phase = 'day';
      m!.daySeconds = 240;
    }
    renderMafia();
  });
}

function checkWin(): boolean {
  const a = alive();
  const mafiaAlive = a.filter((p) => p.role === 'mafia').length;
  const townAlive = a.length - mafiaAlive;
  if (mafiaAlive === 0) {
    m!.winner = 'The town wins — every mafia is out.';
    return true;
  }
  if (mafiaAlive >= townAlive) {
    m!.winner = 'The mafia wins — they now match or outnumber the town.';
    return true;
  }
  return false;
}

/* ---------------- day & vote ---------------- */

function renderDay(): void {
  const card = $('mafiaCard');
  card.innerHTML =
    `<p class="kicker">Day ${m!.round} &middot; discussion</p>` +
    '<div class="timer" id="mDayTimer">4:00</div>' +
    "<p class=\"sub\">Argue, accuse, defend. When you're ready &mdash; or when the clock runs out " +
    '&mdash; put it to a vote.</p>' +
    '<button class="btn" id="mToVote">Go to the vote</button>';

  clearInterval(m!.dayTimer);
  m!.dayTimer = window.setInterval(() => {
    m!.daySeconds--;
    const el = document.getElementById('mDayTimer');
    if (!el) {
      clearInterval(m!.dayTimer);
      return;
    }
    const s = Math.max(0, m!.daySeconds);
    el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    el.classList.toggle('low', m!.daySeconds <= 30);
    if (m!.daySeconds <= 0) clearInterval(m!.dayTimer);
  }, 1000);

  $('mToVote').addEventListener('click', () => {
    clearInterval(m!.dayTimer);
    m!.phase = 'vote';
    renderMafia();
  });
}

function renderVote(): void {
  const card = $('mafiaCard');
  card.innerHTML =
    `<p class="kicker">Day ${m!.round} &middot; the vote</p>` +
    '<h2>Who is the town voting out?</h2>' +
    playerGrid(true) +
    "<button class=\"kicker-link\" id=\"mNoLynch\">Nobody &mdash; the town can't agree</button>";

  onClickAll(card, '.pick[data-i]', (btn) => {
    const p = m!.players[dataNum(btn, 'i')];
    p.alive = false;
    const over = checkWin();
    card.innerHTML =
      '<p class="kicker">Voted out</p>' +
      `<div class="role-card"><span class="r ${ROLE_INFO[p.role].cls}">${ROLE_INFO[p.role].label}</span>` +
      `<span class="d">${escapeHtml(p.name)} is out of the game.</span></div>` +
      `<button class="btn" id="mAfterVote">${over ? 'See the result' : 'Night falls again'}</button>`;
    $('mAfterVote').addEventListener('click', () => {
      if (over) {
        m!.phase = 'over';
      } else {
        m!.phase = 'night';
        m!.nightStep = 0;
        m!.round++;
      }
      renderMafia();
    });
  });

  $('mNoLynch').addEventListener('click', () => {
    m!.phase = 'night';
    m!.nightStep = 0;
    m!.round++;
    renderMafia();
  });
}

export function initMafia(): void {
  $('mafiaHomeBtn').addEventListener('click', () => {
    stopMafiaTimer();
    show('screen-home');
  });
}
