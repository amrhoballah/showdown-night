/** Game 6 - Wavelength on a 1-10 scale.
 *
 *  A discrete 1-10 scale rather than a continuous dial, because "I'd say a 7"
 *  is something a room can actually argue about out loud.
 *
 *  Scoring: 4 for exact, 2 for one off, 1 for two off, nothing further out.
 */

import type { Spectrum } from '../types';
import { SPECTRA } from '../data/spectra';
import { entities, award } from '../scoreboard';
import { $, show, escapeHtml, shuffle, onClickAll, dataNum } from '../ui';

const wave = {
  deck: shuffle(SPECTRA) as Spectrum[],
  idx: 0,
  phase: 'handoff' as 'handoff' | 'target' | 'guess' | 'result',
  target: 5,
  guess: 0,
  teamIdx: 0,
};

/** Centre of slot n on a 10-slot bar, as a percentage. */
function markPct(n: number): number {
  return ((n - 0.5) / 10) * 100;
}

function scaleRow(marks: number[]): string {
  let out = '';
  for (let n = 1; n <= 10; n++) {
    out += `<div class="wave-tick${marks.includes(n) ? ' hit' : ''}">${n}</div>`;
  }
  return `<div class="wave-scale">${out}</div>`;
}

function labels(sp: Spectrum): string {
  return `<div class="wave-labels"><span>1 &middot; ${sp[0]}</span><span>${sp[1]} &middot; 10</span></div>`;
}

export function renderWave(): void {
  if (wave.idx >= wave.deck.length) {
    wave.deck = shuffle(SPECTRA) as Spectrum[];
    wave.idx = 0;
  }
  const sp = wave.deck[wave.idx];
  const card = $('waveCard');
  const ents = entities();
  $('waveProgress').textContent = `Round ${wave.idx + 1}`;

  if (wave.phase === 'handoff') {
    card.innerHTML =
      `<p class="kicker">Wavelength &middot; round ${wave.idx + 1}</p>` +
      '<h2>Pick a clue-giver and pass them the laptop.</h2>' +
      '<div class="narration">The scale runs 1 to 10. Only the clue-giver sees the number ' +
      '&mdash; then they give their team <strong>one word or short phrase</strong> that sits ' +
      'exactly there on this spectrum. No gestures, and obviously no saying the number.</div>' +
      labels(sp) +
      '<div class="wave-track"></div>' +
      scaleRow([]) +
      (ents.length
        ? '<p class="sub">Guessing team:</p><select id="waveTeam" style="background:var(--bg-raised-2);' +
          'color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:10px 14px;' +
          'font-family:inherit;font-size:0.95rem;">' +
          ents
            .map(
              (e, i) =>
                `<option value="${i}"${i === wave.teamIdx ? ' selected' : ''}>${escapeHtml(e.name)}</option>`,
            )
            .join('') +
          '</select>'
        : '') +
      "<button class=\"btn\" id=\"waveShowTarget\">I'm the clue-giver &mdash; show my number</button>";

    $('waveShowTarget').addEventListener('click', () => {
      const sel = document.getElementById('waveTeam') as HTMLSelectElement | null;
      if (sel) wave.teamIdx = Number(sel.value);
      wave.target = 1 + Math.floor(Math.random() * 10);
      wave.phase = 'target';
      renderWave();
    });
    return;
  }

  if (wave.phase === 'target') {
    card.innerHTML =
      '<p class="kicker">Clue-giver only &middot; don&rsquo;t show anyone</p>' +
      labels(sp) +
      `<p class="target-number">${wave.target}</p>` +
      `<div class="wave-track"><div class="wave-needle" style="left:${markPct(wave.target)}%;"></div></div>` +
      scaleRow([wave.target]) +
      `<p class="sub">Think of one word that lands on ${wave.target} &mdash; not near it, on it. ` +
      'Hide the screen before you say it out loud.</p>' +
      '<button class="btn" id="waveHide">Hide &mdash; I&rsquo;ve got my clue</button>';

    $('waveHide').addEventListener('click', () => {
      wave.phase = 'guess';
      renderWave();
    });
    return;
  }

  if (wave.phase === 'guess') {
    const name = ents[wave.teamIdx]?.name ?? 'the team';
    card.innerHTML =
      `<p class="kicker">Round ${wave.idx + 1} &middot; ${escapeHtml(name)} guessing</p>` +
      '<h2>What number is that clue?</h2>' +
      labels(sp) +
      '<div class="wave-track"></div>' +
      '<div class="numpad" id="wavePad">' +
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => `<button data-n="${n}">${n}</button>`).join('') +
      '</div>' +
      '<p class="sub">Argue it out, then tap your answer. 4 points for exact, 2 if you&rsquo;re ' +
      'one off, 1 if you&rsquo;re two off.</p>';

    onClickAll(card, '#wavePad button', (btn) => {
      wave.guess = dataNum(btn, 'n');
      wave.phase = 'result';
      renderWave();
    });
    return;
  }

  // result
  const dist = Math.abs(wave.guess - wave.target);
  const pts = dist === 0 ? 4 : dist === 1 ? 2 : dist === 2 ? 1 : 0;
  const verdict =
    pts === 4 ? 'Exactly it.' : pts === 2 ? 'One off.' : pts === 1 ? 'Two off.' : 'Nowhere near.';
  const name = ents[wave.teamIdx]?.name ?? 'the team';

  card.innerHTML =
    '<p class="kicker">Reveal</p>' +
    '<div class="guess-summary">' +
    `<div><span class="lbl">Guessed</span><span class="val">${wave.guess}</span></div>` +
    `<div><span class="lbl">Target</span><span class="val" style="color:var(--good)">${wave.target}</span></div>` +
    '</div>' +
    labels(sp) +
    '<div class="wave-track">' +
    `<div class="wave-needle" style="left:${markPct(wave.guess)}%;"></div>` +
    `<div class="wave-needle" style="left:${markPct(wave.target)}%;background:var(--good);"></div>` +
    '</div>' +
    scaleRow([wave.guess, wave.target]) +
    `<p class="score-burst"${pts ? '' : ' style="color:var(--ink-faint)"'}>+${pts}</p>` +
    `<h2>${verdict}</h2>` +
    `<div class="btn-row"><button class="btn" id="waveAward">${
      pts ? `Add ${pts} to ${escapeHtml(name)}` : 'Next round'
    }</button></div>`;

  $('waveAward').addEventListener('click', () => {
    if (pts) award(wave.teamIdx, pts);
    wave.idx++;
    wave.teamIdx = (wave.teamIdx + 1) % Math.max(1, entities().length);
    wave.phase = 'handoff';
    renderWave();
  });
}

export function initWave(): void {
  $('waveHomeBtn').addEventListener('click', () => show('screen-home'));
}
