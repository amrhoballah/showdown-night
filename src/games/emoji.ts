/** Game 5 - Emoji Riddles.
 *
 *  Deliberately light: reveal, then tap whoever shouted it first. Meant as a
 *  breather between Jeopardy and Mafia.
 */

import { EMOJI } from '../data/emoji';
import { night, renderScoreboard } from '../scoreboard';
import { entitiesOf, award } from '../night';
import { endGameNow } from '../results';
import { $, show, escapeHtml, shuffle, onClickAll, dataNum } from '../ui';

const em = {
  deck: shuffle(EMOJI),
  idx: 0,
  revealed: false,
};

function reset(): void {
  em.deck = shuffle(EMOJI);
  em.idx = 0;
  em.revealed = false;
}

export function renderEmoji(): void {
  const card = $('emojiCard');

  // Natural finish: one deck is one game. Playing again is a new game from Home.
  if (em.idx >= em.deck.length) {
    card.innerHTML =
      '<p class="kicker">All riddles used</p>' +
      '<h2>That&rsquo;s every riddle.</h2>' +
      '<button class="btn" id="emEnd">End game</button>';
    $('emojiProgress').textContent = 'Finished';
    $('emEnd').addEventListener('click', endGameNow);
    return;
  }

  const item = em.deck[em.idx];
  $('emojiProgress').textContent = `Riddle ${em.idx + 1} of ${em.deck.length}`;
  const ents = entitiesOf(night);

  card.innerHTML =
    `<p class="kicker">${item.h}</p>` +
    `<p class="emoji">${item.e}</p>` +
    (em.revealed
      ? `<p class="huge" style="color:var(--good)">${item.a}</p>` +
        '<p class="sub">Who got it?</p>' +
        '<div class="btn-row">' +
        ents
          .map(
            (e) =>
              `<button class="award-btn" data-id="${e.id}"><span class="sw" style="background:${e.color}"></span>` +
              `+1 ${escapeHtml(e.name)}</button>`,
          )
          .join('') +
        '</div>' +
        '<button class="kicker-link" id="emSkip">Nobody &mdash; next riddle</button>'
      : '<button class="btn" id="emReveal">Reveal the answer</button>');

  if (em.revealed) {
    onClickAll(card, '.award-btn', (btn) => {
      award(night, dataNum(btn, 'id'), 1);
      renderScoreboard();
      em.idx++;
      em.revealed = false;
      renderEmoji();
    });
    $('emSkip').addEventListener('click', () => {
      em.idx++;
      em.revealed = false;
      renderEmoji();
    });
  } else {
    $('emReveal').addEventListener('click', () => {
      em.revealed = true;
      renderEmoji();
    });
  }
}

/** A new Emoji game: a freshly shuffled deck. */
export function startEmoji(): void {
  reset();
  renderEmoji();
}

/** Back into the game in progress, on the riddle it was on. */
export function resumeEmoji(): void {
  renderEmoji();
}

export function initEmoji(): void {
  $('emojiHomeBtn').addEventListener('click', () => show('screen-home'));
}
