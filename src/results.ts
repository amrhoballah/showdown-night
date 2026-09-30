/** The end-of-game result screens: two host-paced beats, then Home.
 *
 *  Beat 1 is the final game scores, ranked, with the winner as the title and a
 *  burst of confetti in the winner's colour. Beat 2 is tonight's standings in
 *  their old order, which then slide into the new order as each row shows the
 *  placement points it just earned ("+14"). The host moves on with the button
 *  or Space.
 *
 *  The room never sees the formula: no place points, pie or weight, only +N.
 */

import type { EndedGame, EntityId, GameType, NightEntity, Standing } from './night';
import { $, show, escapeHtml, currentScreen } from './ui';

export const GAME_NAMES: Record<GameType, string> = {
  jeopardy: 'Jeopardy',
  outburst: 'Outburst',
  act: 'Act It Out',
  emoji: 'Emoji',
  wavelength: 'Wavelength',
};

/** How long beat 2 holds the old order before sliding. */
const SLIDE_DELAY_MS = 900;
const CONFETTI_MS = 2200;

let result: EndedGame | null = null;
let beat: 1 | 2 = 1;
let slideTimer = 0;
let confettiTimer = 0;

function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** 1 + how many are strictly ahead: tied values share the better place. */
function placeOf(value: number, all: number[]): number {
  return 1 + all.filter((o) => o > value).length;
}

function swatch(e: NightEntity): string {
  return `<span class="swatch" style="background:${e.color}"></span>`;
}

function stopResultTimers(): void {
  clearTimeout(slideTimer);
  clearTimeout(confettiTimer);
  document.getElementById('confetti')?.remove();
}

let endGameHandler: () => void = () => {};

/** Set what ending the game in progress does (stop timers, end it, show
 *  these screens). Wired once by the entry point. */
export function onEndGame(fn: () => void): void {
  endGameHandler = fn;
}

/** End the game in progress with no confirm, straight into the result
 *  screens. For a natural finish, where there's nothing left to play. */
export function endGameNow(): void {
  endGameHandler();
}

/** Where beat 2 hands over to: Home, unless the game was ended to start another. */
let afterResults: (() => void) | null = null;

/** Show the result screens for a game that has just ended. They hand back to
 *  Home, or run `then` instead (e.g. to start the game the host switched to). */
export function showResults(ended: EndedGame, then?: () => void): void {
  result = ended;
  beat = 1;
  afterResults = then ?? null;
  show('screen-result');
  renderResult();
}

function next(): void {
  if (beat === 1) {
    beat = 2;
    renderResult();
    return;
  }
  stopResultTimers();
  result = null;
  const then = afterResults;
  afterResults = null;
  if (then) then();
  else show('screen-home');
}

/** Everything the result screens say, in one game's voice. Jeopardy keeps
 *  its own winner line, and the Arabic board's results are wholly Arabic. */
interface Copy {
  finalScores: string;
  wins: (name: string) => string;
  tie: (names: string[]) => string;
  everyoneTies: string;
  toStandings: string;
  spaceToStandings: string;
  after: string;
  standings: string;
  home: string;
  spaceHome: string;
  next: string;
  spaceNext: string;
}

function copyFor(r: EndedGame): Copy {
  if (r.type === 'jeopardy' && r.board === 'ar') {
    return {
      finalScores: 'جيوباردي &middot; النتائج النهائية',
      wins: (name) => `${name} في الصدارة`,
      tie: (names) => `${names.join(' و')} في الصدارة معًا`,
      everyoneTies: 'تعادل الجميع',
      toStandings: 'ترتيب الليلة &larr;',
      spaceToStandings: 'اضغط المسافة لترتيب الليلة',
      after: 'الليلة &middot; بعد جيوباردي',
      standings: 'ترتيب الليلة',
      home: 'العودة إلى الرئيسية',
      spaceHome: 'اضغط المسافة للعودة',
      next: 'إلى اللعبة التالية &larr;',
      spaceNext: 'اضغط المسافة للمتابعة',
    };
  }
  const name = GAME_NAMES[r.type];
  return {
    finalScores: `${name} &middot; final scores`,
    wins: (w) => (r.type === 'jeopardy' ? `${w} takes it` : `${w} wins`),
    tie: (names) => `${names.join(' &amp; ')} tie for the win`,
    everyoneTies: 'Everyone ties',
    toStandings: 'Tonight&rsquo;s standings &rarr;',
    spaceToStandings: 'Space for the standings',
    after: `Tonight &middot; after ${name}`,
    standings: 'Night standings',
    home: 'Back to Home',
    spaceHome: 'Space for Home',
    next: 'On to the next game &rarr;',
    spaceNext: 'Space to carry on',
  };
}

export function renderResult(): void {
  if (!result) return;
  stopResultTimers();
  const ar = result.type === 'jeopardy' && result.board === 'ar';
  const card = $('resultCard');
  card.className = `result-card${ar ? ' ar' : ''}`;
  card.dir = ar ? 'rtl' : 'ltr';
  if (beat === 1) renderScores(result);
  else renderStandings(result);
}

function renderScores(r: EndedGame): void {
  const ranked = [...r.gameScores].sort((a, b) => b.score - a.score);
  const all = ranked.map((g) => g.score);
  const top = ranked[0]?.score ?? 0;
  const winners = ranked.filter((g) => g.score === top).map((g) => g.entity);
  const everyoneTies = winners.length === ranked.length;
  const t = copyFor(r);
  const title = everyoneTies && winners.length > 2
    ? t.everyoneTies
    : winners.length > 1
      ? t.tie(winners.map((w) => escapeHtml(w.name)))
      : t.wins(escapeHtml(winners[0].name));
  const twoCol = ranked.length > 6;

  $('resultCard').innerHTML =
    '<div class="result-head">' +
    `<p class="eyebrow">${t.finalScores}</p>` +
    `<h1 class="result-title">${title}</h1></div>` +
    `<div class="result-scores${twoCol ? ' two-col' : ''}" ` +
    `style="grid-template-rows:repeat(${Math.ceil(ranked.length / 2)}, auto)">` +
    ranked
      .map(
        (g) =>
          `<div class="result-row${g.score === top ? ' win' : ''}">` +
          `<span class="rank mono">${placeOf(g.score, all)}</span>${swatch(g.entity)}` +
          `<span class="nm">${escapeHtml(g.entity.name)}</span>` +
          `<span class="val mono">${g.score}</span></div>`,
      )
      .join('') +
    '</div>' +
    `<div class="result-foot"><span class="result-hint">${t.spaceToStandings}</span>` +
    `<button class="btn" id="resultNext">${t.toStandings}</button></div>`;
  $('resultNext').addEventListener('click', next);

  if (!everyoneTies && !reducedMotion()) confetti(winners.map((w) => w.color));
}

function renderStandings(r: EndedGame): void {
  const t = copyFor(r);
  const n = r.before.length;
  const rowH = n > 6 ? 44 : 84;
  const slide = !reducedMotion();
  const idx = (list: Standing[], id: EntityId) => list.findIndex((s) => s.entity.id === id);
  const beforeTotals = r.before.map((s) => s.total);
  const afterOf = (id: EntityId) => r.after[idx(r.after, id)];

  // Rows are laid out in the old order and moved by `top`, so each row slides
  // from where it was to where it now stands. Without motion, start there.
  const rows = r.before
    .map((s, k) => {
      const now = afterOf(s.entity.id);
      const at = slide ? k : idx(r.after, s.entity.id);
      return (
        `<div class="race-row${slide ? '' : ' moved'}${n > 6 ? ' dense' : ''}" data-id="${s.entity.id}" ` +
        `style="top:${at * rowH}px;height:${rowH - 8}px">` +
        `<span class="rank mono" data-rank>${slide ? placeOf(s.total, beforeTotals) : now.place}</span>` +
        `${swatch(s.entity)}<span class="nm">${escapeHtml(s.entity.name)}</span>` +
        `<span class="gain mono">+${r.earned[s.entity.id] ?? 0}</span>` +
        `<span class="val mono" data-val>${slide ? s.total : now.total}</span></div>`
      );
    })
    .join('');

  $('resultCard').innerHTML =
    '<div class="result-head">' +
    `<p class="eyebrow">${t.after}</p>` +
    `<h1 class="result-title">${t.standings}</h1></div>` +
    `<div class="race" style="height:${n * rowH}px">${rows}</div>` +
    `<div class="result-foot"><span class="result-hint">${afterResults ? t.spaceNext : t.spaceHome}</span>` +
    `<button class="btn" id="resultHome">${afterResults ? t.next : t.home}</button></div>`;
  $('resultHome').addEventListener('click', next);

  if (!slide) return;
  slideTimer = window.setTimeout(() => {
    $('resultCard')
      .querySelectorAll<HTMLElement>('.race-row')
      .forEach((row) => {
        const id = Number(row.dataset.id);
        const now = afterOf(id);
        row.style.top = `${idx(r.after, id) * rowH}px`;
        row.classList.add('moved');
        row.querySelector('[data-val]')!.textContent = String(now.total);
        row.querySelector('[data-rank]')!.textContent = String(now.place);
      });
  }, SLIDE_DELAY_MS);
}

/** One short burst of confetti in the given colours. Pure CSS, no assets. */
function confetti(colors: string[]): void {
  const layer = document.createElement('div');
  layer.id = 'confetti';
  layer.className = 'confetti';
  layer.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 90; i++) {
    const bit = document.createElement('i');
    bit.style.left = `${Math.random() * 100}%`;
    bit.style.background = colors[i % colors.length];
    bit.style.animationDelay = `${Math.random() * 0.5}s`;
    bit.style.animationDuration = `${1.2 + Math.random() * 0.9}s`;
    bit.style.setProperty('--drift', `${(Math.random() - 0.5) * 240}px`);
    bit.style.setProperty('--spin', `${(Math.random() - 0.5) * 1440}deg`);
    layer.appendChild(bit);
  }
  $('screen-result').appendChild(layer);
  confettiTimer = window.setTimeout(() => layer.remove(), CONFETTI_MS);
}

export function initResults(): void {
  document.addEventListener('keydown', (e) => {
    if (currentScreen() !== 'screen-result' || e.key !== ' ' || e.repeat) return;
    // A focused button already acts on Space; don't advance twice.
    if (e.target instanceof HTMLButtonElement) return;
    e.preventDefault();
    next();
  });
}
