/** Game 2 - Outburst.
 *
 *  The category stays hidden until the clock starts, so the shared TV screen
 *  never leaks the answers. Everyone shouts for 60 seconds, the list reveals at
 *  the buzzer, and the group tallies how many they actually said (honour
 *  system - the listed items are examples, so award generously for anything in
 *  the same spirit).
 */

import { OUTBURST } from '../data/outburst';
import { entities, award } from '../scoreboard';
import { $, show, escapeHtml } from '../ui';

const ob = {
  index: 0,
  secondsLeft: 60,
  timer: 0 as number,
};

export function stopOutburstTimer(): void {
  clearInterval(ob.timer);
}

export function renderOutburst(): void {
  const round = OUTBURST[ob.index];
  $('obProgress').textContent = `Round ${ob.index + 1} of ${OUTBURST.length}`;
  const card = $('obCard');

  card.innerHTML =
    `<p class="ob-round mono">ROUND ${ob.index + 1} OF ${OUTBURST.length}</p>` +
    '<h2 class="ob-cat">Ready when you are.</h2>' +
    '<p class="sub">The category stays hidden until you start the clock. One person shouts ' +
    '&ldquo;go,&rdquo; everyone else calls out anything that fits &mdash; no wrong guesses, just ' +
    'keep going until the buzzer.</p>' +
    '<button class="btn" id="obStartBtn">Reveal category &amp; start 60s</button>';

  $('obStartBtn').addEventListener('click', () => startRound(round));
}

function startRound(round: (typeof OUTBURST)[number]): void {
  const card = $('obCard');
  ob.secondsLeft = 60;

  card.innerHTML =
    `<p class="ob-round mono">ROUND ${ob.index + 1} OF ${OUTBURST.length}</p>` +
    `<h2 class="ob-cat">${escapeHtml(round.cat)}</h2>` +
    '<div class="timer" id="obTimerEl">60</div>' +
    '<p class="sub">Shout out as many as you can. The list reveals the second the clock hits zero.</p>' +
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
  const round = OUTBURST[ob.index];
  const card = $('obCard');

  card.innerHTML =
    "<p class=\"ob-round mono\">TIME'S UP</p>" +
    `<h2 class="ob-cat">${escapeHtml(round.cat)}</h2>` +
    '<div class="ob-answers">' +
    round.items.map((it) => `<div class="ob-answer">${escapeHtml(it)}</div>`).join('') +
    '</div>' +
    '<p class="sub">Talk it over: how many of these did the group actually call out? Pick a team, ' +
    'set the count, and add the points (1 point each).</p>' +
    '<div id="obTallyWrap"></div>';

  buildTally();
}

function buildTally(): void {
  const wrap = $('obTallyWrap');
  const ents = entities();
  let count = 0;

  wrap.innerHTML =
    '<div style="display:flex;flex-direction:column;align-items:center;gap:14px;">' +
    '<select id="obTeamSelect" style="background:var(--bg-raised-2);color:var(--ink);' +
    'border:1px solid var(--line);border-radius:10px;padding:10px 14px;font-family:inherit;font-size:0.95rem;">' +
    ents.map((e, i) => `<option value="${i}">${escapeHtml(e.name)}</option>`).join('') +
    '</select>' +
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
  $('obAwardBtn').addEventListener('click', () => {
    award(Number(($('obTeamSelect') as HTMLSelectElement).value), count);
    ob.index++;
    if (ob.index >= OUTBURST.length) {
      $('obCard').innerHTML =
        '<p class="ob-round mono">ALL ROUNDS COMPLETE</p>' +
        "<h2 class=\"ob-cat\">That's every category.</h2>" +
        '<p class="sub">Check the scoreboard up top for the final tally.</p>';
      $('obProgress').textContent = 'Finished';
    } else {
      renderOutburst();
    }
  });
}

export function initOutburst(): void {
  $('obHomeBtn').addEventListener('click', () => {
    stopOutburstTimer();
    show('screen-home');
  });
}
