/** "Continue tonight?": offered on load when the saved night has a finished
 *  game or a game in progress, so a reload, closed tab or crash never loses
 *  the night. It shows who is playing, how far the night has got and the
 *  standings, readable from across the room.
 */

import { night } from './scoreboard';
import { entitiesOf, finishedGames, gameInProgress, standings } from './night';
import { GAME_NAMES } from './results';
import { $, show, escapeHtml } from './ui';

/** True when there's something worth asking about: a finished game or a
 *  game in progress. A night with only a setup is restored silently. */
export function hasNightToContinue(): boolean {
  return finishedGames(night).length > 0 || !!gameInProgress(night);
}

function inProgressText(): string {
  const game = gameInProgress(night);
  if (!game) return 'No game in progress';
  const board = game.board === 'ar' ? ' (Arabic board)' : game.board === 'en' ? ' (English board)' : '';
  return `In progress: <strong>${GAME_NAMES[game.type]}${board}</strong>`;
}

/** Show the card. Continue runs `onContinue`; "Start a new night" runs
 *  `onNewNight`, which confirms before clearing anything. */
export function showContinue(onContinue: () => void, onNewNight: () => void): void {
  const done = finishedGames(night).length;
  const ranked = standings(night);
  const card = $('continueCard');

  card.innerHTML =
    '<div class="result-head"><p class="eyebrow">Saved night</p>' +
    '<h1 class="result-title">Continue tonight?</h1></div>' +
    '<div class="continue-chips">' +
    entitiesOf(night)
      .map(
        (e) =>
          `<div class="score-chip"><span class="swatch" style="background:${e.color}"></span>` +
          `<span class="name">${escapeHtml(e.name)}</span></div>`,
      )
      .join('') +
    '</div>' +
    '<p class="continue-facts">' +
    `<span><strong>${done}</strong> game${done === 1 ? '' : 's'} finished</span>` +
    `<span>${inProgressText()}</span></p>` +
    `<div class="result-scores compact${ranked.length > 6 ? ' two-col' : ''}" ` +
    `style="grid-template-rows:repeat(${Math.ceil(ranked.length / 2)}, auto)">` +
    ranked
      .map(
        (s) =>
          `<div class="result-row"><span class="rank mono">${s.place}</span>` +
          `<span class="swatch" style="background:${s.entity.color}"></span>` +
          `<span class="nm">${escapeHtml(s.entity.name)}</span>` +
          `<span class="val mono">${s.total}</span></div>`,
      )
      .join('') +
    '</div>' +
    '<div class="continue-foot">' +
    '<button class="btn ghost" id="continueNew">Start a new night</button>' +
    '<button class="btn" id="continueGo">Continue</button></div>';

  $('continueGo').addEventListener('click', onContinue);
  $('continueNew').addEventListener('click', onNewNight);
  show('screen-continue');
  $('continueGo').focus();
}
