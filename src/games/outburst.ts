/** Game 2 - Outburst.
 *
 *  One team per round: the team whose turn it is shouts, and is credited. The
 *  category stays hidden until the clock starts, so the shared TV screen never
 *  leaks the answers. That team shouts for 60 seconds, the list reveals at the
 *  buzzer, and the room tallies how many they actually said (honour system -
 *  the listed items are examples, so award generously for anything in the same
 *  spirit).
 */

import { OUTBURST } from '../data/outburst';
import { entities, award, recordTurn, nextTurnIndex } from '../scoreboard';
import { fullLaps } from '../night';
import { endGameNow } from '../results';
import { $, show, escapeHtml } from '../ui';

const ob = {
  index: 0,
  secondsLeft: 60,
  timer: 0 as number,
  /** The team shouting this round, chosen before the clock starts. */
  teamIdx: 0,
  /** Where the current round is: before the clock, running, or tallying. */
  phase: 'ready' as 'ready' | 'running' | 'tally',
};

function teamName(): string {
  return escapeHtml(entities()[ob.teamIdx]?.name ?? 'your team');
}

export function stopOutburstTimer(): void {
  clearInterval(ob.timer);
}

export function renderOutburst(): void {
  ob.phase = 'ready';
  if (ob.index >= roundCount()) {
    renderComplete();
    return;
  }
  const round = OUTBURST[ob.index];
  $('obProgress').textContent = `Round ${ob.index + 1} of ${roundCount()}`;
  const card = $('obCard');
  const ents = entities();
  // Whoever has had the fewest turns shouts next; the host can change it.
  const next = nextTurnIndex();

  card.innerHTML =
    `<p class="ob-round mono">ROUND ${ob.index + 1} OF ${roundCount()}</p>` +
    '<h2 class="ob-cat">Ready when you are.</h2>' +
    '<p class="sub">The category stays hidden until you start the clock. Someone shouts ' +
    '&ldquo;go,&rdquo; and your team calls out anything that fits &mdash; no wrong guesses, just ' +
    'keep going until the buzzer.</p>' +
    '<p class="sub">Whose turn?</p>' +
    '<select id="obTeamSelect" style="background:var(--bg-raised-2);color:var(--ink);' +
    'border:1px solid var(--line);border-radius:10px;padding:10px 14px;font-family:inherit;font-size:0.95rem;">' +
    ents
      .map(
        (e, i) =>
          `<option value="${i}"${i === next ? ' selected' : ''}>${escapeHtml(e.name)}</option>`,
      )
      .join('') +
    '</select>' +
    '<button class="btn" id="obStartBtn">Reveal category &amp; start 60s</button>';

  $('obStartBtn').addEventListener('click', () => {
    ob.teamIdx = Number(($('obTeamSelect') as HTMLSelectElement).value);
    startRound(round);
  });
}

function startRound(round: (typeof OUTBURST)[number]): void {
  const card = $('obCard');
  ob.secondsLeft = 60;
  ob.phase = 'running';

  card.innerHTML =
    `<p class="ob-round mono">ROUND ${ob.index + 1} OF ${roundCount()}</p>` +
    `<h2 class="ob-cat">${escapeHtml(round.cat)}</h2>` +
    '<div class="timer" id="obTimerEl">60</div>' +
    `<p class="sub">${teamName()}: shout out as many as you can. The list reveals the second the clock hits zero.</p>` +
    "<button class=\"btn ghost\" id=\"obStopBtn\">Time's up &mdash; reveal now</button>";

  $('obStopBtn').addEventListener('click', finishTimer);

  clearInterval(ob.timer);
  ob.timer = window.setInterval(() => {
    ob.secondsLeft--;
    const el = document.getElementById('obTimerEl');
    if (el) {
      el.textContent = String(ob.secondsLeft);
      el.classList.toggle('low', ob.secondsLeft <= 10);
    }
    if (ob.secondsLeft <= 0) finishTimer();
  }, 1000);
}

function finishTimer(): void {
  clearInterval(ob.timer);
  ob.phase = 'tally';
  const round = OUTBURST[ob.index];
  const card = $('obCard');

  card.innerHTML =
    "<p class=\"ob-round mono\">TIME'S UP</p>" +
    `<h2 class="ob-cat">${escapeHtml(round.cat)}</h2>` +
    '<div class="ob-answers">' +
    round.items.map((it) => `<div class="ob-answer">${escapeHtml(it)}</div>`).join('') +
    '</div>' +
    `<p class="sub">Talk it over: how many of these did ${teamName()} actually call out? ` +
    'Set the count and add the points (1 point each).</p>' +
    '<div id="obTallyWrap"></div>';

  buildTally();
}

function buildTally(): void {
  const wrap = $('obTallyWrap');
  let count = 0;

  wrap.innerHTML =
    '<div style="display:flex;flex-direction:column;align-items:center;gap:14px;">' +
    `<p class="sub" style="margin:0;">For <strong>${teamName()}</strong></p>` +
    '<div class="tally"><button id="obMinus" aria-label="fewer">&minus;</button>' +
    '<span class="n mono" id="obCount">0</span>' +
    '<button id="obPlus" aria-label="more">+</button></div>' +
    '<button class="btn" id="obAwardBtn">Add points &amp; continue</button>' +
    '</div>';

  const countEl = $('obCount');
  $('obMinus').addEventListener('click', () => {
    count = Math.max(0, count - 1);
    countEl.textContent = String(count);
  });
  $('obPlus').addEventListener('click', () => {
    count = Math.min(OUTBURST[ob.index].items.length, count + 1);
    countEl.textContent = String(count);
  });
  // Adding the points confirms the team's turn, even at 0.
  $('obAwardBtn').addEventListener('click', () => {
    award(ob.teamIdx, count);
    recordTurn(ob.teamIdx);
    ob.index++;
    renderOutburst();
  });
}

/** Rounds in this game: the last full lap, so every team has had the same
 *  number of turns. */
function roundCount(): number {
  return fullLaps(OUTBURST.length, entities().length);
}

/** Natural finish, after the last full lap. */
function renderComplete(): void {
  $('obCard').innerHTML =
    '<p class="ob-round mono">ALL ROUNDS COMPLETE</p>' +
    "<h2 class=\"ob-cat\">That's every category.</h2>" +
    '<button class="btn" id="obEndBtn">End game</button>';
  $('obProgress').textContent = 'Finished';
  $('obEndBtn').addEventListener('click', endGameNow);
}

/** A new Outburst game, from round 1. */
export function startOutburst(): void {
  stopOutburstTimer();
  ob.index = 0;
  renderOutburst();
}

/** Back into the game in progress. A running round goes back to its ready
 *  card, so the clock starts again from 60 rather than carrying on; a round
 *  already being tallied stays on its tally. */
export function resumeOutburst(): void {
  stopOutburstTimer();
  if (ob.phase === 'tally') finishTimer();
  else renderOutburst();
}

export function initOutburst(): void {
  $('obHomeBtn').addEventListener('click', () => {
    stopOutburstTimer();
    show('screen-home');
  });
}
