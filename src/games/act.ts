/** Game 4 - Act It Out (reverse Heads Up).
 *
 *  The guesser sits with their back to the TV, so the shared screen showing the
 *  word is the point rather than a problem: everyone except the guesser is in
 *  on it and acts or describes it.
 */

import { ACT_WORDS } from '../data/act';
import { entities, award, recordTurn, nextTurnIndex } from '../scoreboard';
import { $, show, escapeHtml, shuffle } from '../ui';

const act = {
  phase: 'ready' as 'ready' | 'play' | 'done',
  deck: [] as string[],
  idx: 0,
  got: 0,
  seconds: 60,
  timer: 0 as number,
  teamIdx: 0,
};

export function stopActTimer(): void {
  clearInterval(act.timer);
}

export function renderAct(): void {
  const card = $('actCard');

  if (act.phase === 'ready') {
    const ents = entities();
    // Whoever has had the fewest turns plays next; the host can change it.
    const next = nextTurnIndex();
    card.innerHTML =
      '<p class="kicker">Act It Out</p>' +
      '<h2>One guesser, back to the screen.</h2>' +
      '<div class="narration">Pick who is guessing and sit them facing away from the TV. ' +
      'Everyone else can see the word and has 60 seconds to act, describe, or mime &mdash; no ' +
      'saying the word itself or anything in it.</div>' +
      (ents.length
        ? '<p class="sub">Playing for:</p><select id="actTeam" style="background:var(--bg-raised-2);' +
          'color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:10px 14px;' +
          'font-family:inherit;font-size:0.95rem;">' +
          ents
            .map(
              (e, i) =>
                `<option value="${i}"${i === next ? ' selected' : ''}>${escapeHtml(e.name)}</option>`,
            )
            .join('') +
          '</select>'
        : '') +
      '<button class="btn" id="actStart">Start the 60 seconds</button>';

    $('actStart').addEventListener('click', () => {
      const sel = document.getElementById('actTeam') as HTMLSelectElement | null;
      act.teamIdx = sel ? Number(sel.value) : 0;
      act.deck = shuffle(ACT_WORDS);
      act.idx = 0;
      act.got = 0;
      act.seconds = 60;
      act.phase = 'play';
      renderAct();
    });
    return;
  }

  if (act.phase === 'play') {
    card.innerHTML =
      '<p class="kicker">Guesser: eyes off the screen</p>' +
      `<div class="timer" id="actTimer">${act.seconds}</div>` +
      `<p class="huge">${escapeHtml(act.deck[act.idx % act.deck.length])}</p>` +
      '<div class="btn-row"><button class="btn" id="actGot">Got it &mdash; next</button>' +
      '<button class="btn ghost" id="actSkip">Skip</button></div>' +
      `<p class="sub mono">Correct so far: <span id="actScore">${act.got}</span></p>`;

    $('actGot').addEventListener('click', () => {
      act.got++;
      act.idx++;
      refreshWord();
    });
    $('actSkip').addEventListener('click', () => {
      act.idx++;
      refreshWord();
    });

    clearInterval(act.timer);
    act.timer = window.setInterval(() => {
      act.seconds--;
      const el = document.getElementById('actTimer');
      if (el) {
        el.textContent = String(act.seconds);
        el.classList.toggle('low', act.seconds <= 10);
      }
      if (act.seconds <= 0) {
        clearInterval(act.timer);
        act.phase = 'done';
        renderAct();
      }
    }, 1000);
    return;
  }

  // done
  clearInterval(act.timer);
  const name = entities()[act.teamIdx]?.name ?? 'the team';
  card.innerHTML =
    '<p class="kicker">Time&rsquo;s up</p>' +
    `<p class="score-burst">${act.got}</p>` +
    `<h2>${act.got === 1 ? 'one correct' : `${act.got} correct`}</h2>` +
    `<p class="sub">That&rsquo;s ${act.got} point${act.got === 1 ? '' : 's'} for ${escapeHtml(name)}.</p>` +
    '<div class="btn-row"><button class="btn" id="actAward">Add the points</button>' +
    '<button class="btn ghost" id="actAgain">Another turn</button></div>';

  // Adding the points confirms the turn, even at 0. "Another turn" is a
  // do-over: the round is discarded and no turn is counted.
  $('actAward').addEventListener('click', () => {
    award(act.teamIdx, act.got);
    recordTurn(act.teamIdx);
    act.phase = 'ready';
    renderAct();
  });
  $('actAgain').addEventListener('click', () => {
    act.phase = 'ready';
    renderAct();
  });
}

/** Swap just the word and the running count, so the timer keeps ticking. */
function refreshWord(): void {
  const wordEl = $('actCard').querySelector('.huge');
  const scoreEl = document.getElementById('actScore');
  if (wordEl) wordEl.textContent = act.deck[act.idx % act.deck.length];
  if (scoreEl) scoreEl.textContent = String(act.got);
}

/** A new Act It Out game, from the first "Start". */
export function startAct(): void {
  stopActTimer();
  act.phase = 'ready';
  renderAct();
}

/** Back into the game in progress. A running clock goes back to "Start", so
 *  a turn can't carry on from where it was left; a finished turn waiting for
 *  its points stays. */
export function resumeAct(): void {
  stopActTimer();
  if (act.phase === 'play') act.phase = 'ready';
  renderAct();
}

export function initAct(): void {
  $('actHomeBtn').addEventListener('click', () => {
    stopActTimer();
    act.phase = 'ready';
    show('screen-home');
  });
}
