/** Game 1 - bilingual Jeopardy.
 *
 *  Two independent boards (English and Arabic) with their own questions, their
 *  own hidden Daily Double and their own Final Jeopardy. Both boards award into
 *  the same shared scoreboard, so a night can mix them freely.
 *
 *  Scoring rules, deliberately chosen:
 *  - A normal wrong answer costs nothing (keeps a party game friendly).
 *  - A Daily Double *does* swing both ways, because a wager without downside
 *    is not a wager.
 *  - Final Jeopardy wagers also swing both ways, capped at the team's score.
 */

import type { Board, Lang, Question, Category } from '../types';
import { BOARDS } from '../data/boards';
import { state, entities, award } from '../scoreboard';
import { $, show, escapeHtml, onClickAll, dataNum } from '../ui';

interface JeopardyState {
  lang: Lang;
  used: Record<Lang, Record<string, boolean>>;
  dd: Record<Lang, string | null>;
  finalDone: Record<Lang, boolean>;
  currentCell: string | null;
  wager: number;
  wagerTeam: number;
  finalWagers: number[];
  finalVerdicts: (boolean | null)[];
}

const jeop: JeopardyState = {
  lang: 'en',
  used: { en: {}, ar: {} },
  dd: { en: null, ar: null },
  finalDone: { en: false, ar: false },
  currentCell: null,
  wager: 0,
  wagerTeam: 0,
  finalWagers: [],
  finalVerdicts: [],
};

const LANGS: Lang[] = ['en', 'ar'];

function activeBoard(): Board {
  return BOARDS[jeop.lang];
}

/** Hide the Daily Double anywhere except the 100 row, so it always carries risk. */
function pickDailyDouble(lang: Lang): void {
  const cats = BOARDS[lang].cats;
  const ci = Math.floor(Math.random() * cats.length);
  const qi = 1 + Math.floor(Math.random() * (cats[ci].qs.length - 1));
  jeop.dd[lang] = `${ci}-${qi}`;
}

function boardProgress(lang: Lang): string {
  const total = BOARDS[lang].cats.reduce((n, c) => n + c.qs.length, 0);
  return `${Object.keys(jeop.used[lang]).length}/${total}`;
}

function cellData(key: string): { cat: Category; q: Question } {
  const [ci, qi] = key.split('-').map(Number);
  const cat = activeBoard().cats[ci];
  return { cat, q: cat.qs[qi] };
}

/* ---------------- board picker ---------------- */

export function renderPicker(): void {
  const card = $('pickerCard');
  card.innerHTML =
    '<p class="kicker">Jeopardy &middot; choose a board</p>' +
    '<h2>Which board are you playing?</h2>' +
    '<div class="lang-grid">' +
    LANGS.map((L) => {
      const b = BOARDS[L];
      const started = Object.keys(jeop.used[L]).length;
      return (
        `<button class="lang-card" data-lang="${L}">` +
        `<span class="big${b.rtl ? ' ar' : ''}">${b.label}</span>` +
        `<span class="meta${b.rtl ? ' ar' : ''}">${b.sub}</span>` +
        `<span class="done">${started ? `${boardProgress(L)} used` : 'fresh board'}</span>` +
        '</button>'
      );
    }).join('') +
    '</div>' +
    '<p class="sub">Each board has its own questions, its own hidden Daily Double, and its own ' +
    'Final Jeopardy &mdash; so you can play one now and the other later. Points from both go to ' +
    'the same scoreboard.</p>';

  onClickAll(card, '.lang-card', (btn) => {
    jeop.lang = btn.getAttribute('data-lang') as Lang;
    if (!jeop.dd[jeop.lang]) pickDailyDouble(jeop.lang);
    show('screen-board');
    renderBoard();
  });
}

/* ---------------- the board ---------------- */

export function renderBoard(): void {
  const b = activeBoard();
  const cats = b.cats;
  const board = $('board');
  board.setAttribute('dir', b.rtl ? 'rtl' : 'ltr');

  const title = $('boardTitle');
  title.textContent = b.rtl ? 'اختر فئة وقيمة' : 'Pick a category and a value';
  title.className = b.rtl ? 'ar' : '';
  title.style.fontSize = '1.8rem';
  $('boardEyebrow').textContent = b.rtl ? 'جيوباردي · اللوحة العربية' : 'Jeopardy · English board';
  $('boardProgress').textContent = `${boardProgress(jeop.lang)} used`;

  let html = cats
    .map((cat) => `<div class="cat-head${b.rtl ? ' ar' : ''}">${escapeHtml(cat.name)}</div>`)
    .join('');

  const maxQ = Math.max(...cats.map((c) => c.qs.length));
  for (let r = 0; r < maxQ; r++) {
    cats.forEach((cat, ci) => {
      const q = cat.qs[r];
      const key = `${ci}-${r}`;
      const used = jeop.used[jeop.lang][key];
      html +=
        `<button class="cell" data-key="${key}" data-hard="${q.v >= 400 ? 1 : 0}" ` +
        `${used ? 'disabled' : ''}>${used ? '&mdash;' : q.v}</button>`;
    });
  }
  board.innerHTML = html;
  onClickAll(board, '.cell:not(:disabled)', (btn) => openQuestion(btn.getAttribute('data-key')!));

  const allUsed = Object.keys(jeop.used[jeop.lang]).length >= maxQ * cats.length;
  const fb = $('finalBtn');
  fb.hidden = jeop.finalDone[jeop.lang];
  fb.textContent = b.rtl ? 'السؤال الأخير' : 'Final Jeopardy';
  fb.className = allUsed ? 'btn' : 'btn ghost';
}

function openQuestion(key: string): void {
  jeop.currentCell = key;
  const d = cellData(key);
  if (jeop.dd[jeop.lang] === key && !jeop.used[jeop.lang][key]) {
    renderDailyDouble(d);
    return;
  }
  jeop.wager = 0;
  showQuestion(d, d.q.v);
}

function showQuestion(d: { cat: Category; q: Question }, pts: number): void {
  const b = activeBoard();
  const arCls = b.rtl ? ' ar' : '';

  $('qPts').textContent = b.rtl
    ? `${d.cat.name} · ${pts}`
    : `${d.cat.name.toUpperCase()} · ${pts} PTS`;
  $('qPts').className = `pts mono${arCls}`;
  $('qText').textContent = d.q.q;
  $('qText').className = `qtext${arCls}`;
  $('aText').textContent = d.q.a;
  $('aText').className = `atext${arCls}`;
  $('aText').hidden = true;
  $('awardRow').hidden = true;
  $('skipAwardBtn').hidden = true;
  $('revealBtn').hidden = false;
  $('revealBtn').textContent = b.rtl ? 'اكشف الإجابة' : 'Reveal answer';
  $('skipAwardBtn').textContent = b.rtl ? 'لا أحد أجاب — تخطَّ' : 'No one got it — skip';
  $('backToBoardBtn').textContent = b.rtl ? '→ عودة إلى اللوحة' : '← Back to board';

  const note = $('ddNote');
  note.hidden = !jeop.wager;
  if (jeop.wager) {
    const who = entities()[jeop.wagerTeam]?.name ?? '';
    note.textContent = b.rtl
      ? `مراهنة مزدوجة: ${who} راهن بـ ${jeop.wager} نقطة.`
      : `Daily Double: ${who} wagered ${jeop.wager}.`;
    note.className = `sub${arCls}`;
  }
  show('screen-question');
}

/* ---------------- daily double ---------------- */

function renderDailyDouble(d: { cat: Category; q: Question }): void {
  const b = activeBoard();
  const ents = entities();
  const card = $('ddCard');
  const arCls = b.rtl ? ' ar' : '';

  card.innerHTML =
    `<p class="dd-banner">${b.rtl ? 'مراهنة مزدوجة!' : 'DAILY DOUBLE!'}</p>` +
    `<h2 class="${b.rtl ? 'ar' : ''}">${
      b.rtl
        ? 'هذه الخانة مخفية بها مراهنة. اختر الفريق ثم المبلغ.'
        : 'This square was hiding a wager. Pick the team, then the stake.'
    }</h2>` +
    `<p class="sub${arCls}">${
      b.rtl
        ? `إن أجاب الفريق صحيحًا يكسب المبلغ، وإن أخطأ يخسره. الحد الأدنى ${d.q.v} نقطة.`
        : `Answer right and the team gains the wager; answer wrong and it loses it. Minimum ${d.q.v}.`
    }</p>` +
    '<div class="wager-grid">' +
    ents
      .map((e, i) => {
        const cap = Math.max(d.q.v, state.scores[i] || 0);
        return (
          `<div class="wager-row"><span class="who"><span class="sw" style="background:${e.color}"></span>` +
          `${escapeHtml(e.name)}</span>` +
          `<span class="cap">${b.rtl ? 'الحد الأقصى' : 'max'} ${cap}</span>` +
          `<input type="number" id="ddW${i}" min="${d.q.v}" max="${cap}" value="${d.q.v}" step="50">` +
          `<button class="btn" data-i="${i}" style="padding:10px 14px;font-size:0.85rem;">` +
          `${b.rtl ? 'هذا فريقنا' : 'This is our team'}</button></div>`
        );
      })
      .join('') +
    '</div>';

  onClickAll(card, 'button[data-i]', (btn) => {
    const i = dataNum(btn, 'i');
    const inp = $(`ddW${i}`) as HTMLInputElement;
    const cap = Math.max(d.q.v, state.scores[i] || 0);
    jeop.wager = Math.min(cap, Math.max(d.q.v, parseInt(inp.value, 10) || d.q.v));
    jeop.wagerTeam = i;
    showQuestion(d, jeop.wager);
  });

  show('screen-dd');
}

/* ---------------- awarding ---------------- */

function buildAwardRow(): void {
  const row = $('awardRow');
  const b = activeBoard();
  const d = cellData(jeop.currentCell!);
  const pts = jeop.wager || d.q.v;

  if (jeop.wager) {
    const e = entities()[jeop.wagerTeam] ?? { name: '', color: 'var(--accent)' };
    row.innerHTML =
      `<button class="award-btn" data-dd="right"><span class="sw" style="background:${e.color}"></span>` +
      `${b.rtl ? `صحيح +${pts}` : `Correct +${pts}`}</button>` +
      '<button class="award-btn" data-dd="wrong"><span class="sw" style="background:var(--alert)"></span>' +
      `${b.rtl ? `خطأ −${pts}` : `Wrong −${pts}`}</button>`;
    onClickAll(row, '.award-btn', (btn) => {
      award(jeop.wagerTeam, btn.getAttribute('data-dd') === 'right' ? pts : -pts);
      finishCell();
    });
    return;
  }

  row.innerHTML = entities()
    .map(
      (e, i) =>
        `<button class="award-btn" data-i="${i}"><span class="sw" style="background:${e.color}"></span>` +
        `+${pts} ${escapeHtml(e.name)}</button>`,
    )
    .join('');
  onClickAll(row, '.award-btn', (btn) => {
    award(dataNum(btn, 'i'), pts);
    finishCell();
  });
}

function finishCell(): void {
  if (jeop.currentCell) jeop.used[jeop.lang][jeop.currentCell] = true;
  jeop.wager = 0;
  show('screen-board');
  renderBoard();
}

/* ---------------- final jeopardy ---------------- */

type FinalStep = 'wager' | 'question' | 'verdict' | 'standings';

export function renderFinal(step: FinalStep): void {
  const b = activeBoard();
  const ents = entities();
  const card = $('finalCard');
  const arCls = b.rtl ? ' ar' : '';

  if (step === 'wager') {
    jeop.finalWagers = ents.map((_, i) => Math.max(0, Math.floor((state.scores[i] || 0) / 2)));
    card.innerHTML =
      `<p class="kicker">${b.rtl ? 'السؤال الأخير' : 'Final Jeopardy'}</p>` +
      `<h2 class="${b.rtl ? 'ar' : ''}">${escapeHtml(b.finalCat)}</h2>` +
      `<div class="narration${arCls}">${
        b.rtl
          ? 'هذه هي الفئة فقط. كل فريق يحدد مبلغ المراهنة الآن قبل رؤية السؤال — يمكن أن يصل إلى كامل رصيده. الإجابة الصحيحة تضيف المبلغ والخطأ يخصمه.'
          : 'That is the category — nothing else. Each team sets its wager now, before seeing the question, up to its entire score. Right answer adds the wager, wrong answer subtracts it.'
      }</div>` +
      '<div class="wager-grid">' +
      ents
        .map((e, i) => {
          const cap = Math.max(0, state.scores[i] || 0);
          return (
            `<div class="wager-row"><span class="who"><span class="sw" style="background:${e.color}"></span>` +
            `${escapeHtml(e.name)}</span>` +
            `<span class="cap">${b.rtl ? 'الرصيد' : 'score'} ${cap}</span>` +
            `<input type="number" id="fW${i}" min="0" max="${cap}" value="${jeop.finalWagers[i]}" step="50"></div>`
          );
        })
        .join('') +
      '</div>' +
      `<button class="btn" id="fLock">${
        b.rtl ? 'ثبّت المراهنات واعرض السؤال' : 'Lock wagers & show the question'
      }</button>`;

    $('fLock').addEventListener('click', () => {
      ents.forEach((_, i) => {
        const cap = Math.max(0, state.scores[i] || 0);
        const v = parseInt(($(`fW${i}`) as HTMLInputElement).value, 10) || 0;
        jeop.finalWagers[i] = Math.min(cap, Math.max(0, v));
      });
      renderFinal('question');
    });
    show('screen-final');
    return;
  }

  if (step === 'question') {
    let secs = 60;
    card.innerHTML =
      `<p class="kicker">${escapeHtml(b.finalCat)}</p>` +
      '<div class="timer" id="fTimer">60</div>' +
      `<p class="qtext${arCls}" style="font-size:clamp(1.3rem,3.2vw,2rem);">${escapeHtml(b.finalQ)}</p>` +
      `<p class="sub${arCls}">${
        b.rtl
          ? 'اكتبوا إجاباتكم على ورقة — بدون صوت.'
          : 'Write your answers down on paper — no shouting this time.'
      }</p>` +
      `<button class="btn ghost" id="fReveal">${b.rtl ? 'اكشف الإجابة' : 'Reveal the answer'}</button>`;

    const t = window.setInterval(() => {
      secs--;
      const el = document.getElementById('fTimer');
      if (!el) {
        clearInterval(t);
        return;
      }
      el.textContent = String(secs);
      el.classList.toggle('low', secs <= 10);
      if (secs <= 0) clearInterval(t);
    }, 1000);

    $('fReveal').addEventListener('click', () => {
      clearInterval(t);
      renderFinal('verdict');
    });
    return;
  }

  if (step === 'verdict') {
    jeop.finalVerdicts = ents.map(() => null);
    card.innerHTML =
      `<p class="kicker">${b.rtl ? 'الإجابة' : 'The answer'}</p>` +
      `<p class="huge${arCls}" style="color:var(--good);font-size:clamp(1.2rem,2.8vw,1.7rem);max-width:40ch;">` +
      `${escapeHtml(b.finalA)}</p>` +
      '<div class="wager-grid">' +
      ents
        .map(
          (e, i) =>
            `<div class="wager-row"><span class="who"><span class="sw" style="background:${e.color}"></span>` +
            `${escapeHtml(e.name)}</span>` +
            `<span class="cap">${b.rtl ? 'راهن بـ' : 'wagered'} ${jeop.finalWagers[i]}</span>` +
            `<div class="verdict-row"><button class="yes" data-i="${i}" data-v="1">${
              b.rtl ? 'صحيح' : 'Right'
            }</button>` +
            `<button class="no" data-i="${i}" data-v="0">${b.rtl ? 'خطأ' : 'Wrong'}</button></div></div>`,
        )
        .join('') +
      '</div>' +
      `<button class="btn" id="fApply">${b.rtl ? 'احسب النتيجة النهائية' : 'Settle the scores'}</button>`;

    onClickAll(card, '.verdict-row button', (btn) => {
      jeop.finalVerdicts[dataNum(btn, 'i')] = btn.getAttribute('data-v') === '1';
      const row = btn.parentElement!;
      row.querySelectorAll('button').forEach((x) => x.classList.remove('on'));
      btn.classList.add('on');
    });

    $('fApply').addEventListener('click', () => {
      ents.forEach((_, i) => {
        if (jeop.finalVerdicts[i] === true) award(i, jeop.finalWagers[i]);
        else if (jeop.finalVerdicts[i] === false) award(i, -jeop.finalWagers[i]);
      });
      jeop.finalDone[jeop.lang] = true;
      renderFinal('standings');
    });
    return;
  }

  // standings
  const rows = entities()
    .map((e, i) => ({ name: e.name, color: e.color, score: state.scores[i] || 0 }))
    .sort((a, c) => c.score - a.score);

  card.innerHTML =
    `<p class="kicker">${b.rtl ? 'النتيجة النهائية' : 'Final standings'}</p>` +
    `<h2 class="${b.rtl ? 'ar' : ''}">${escapeHtml(rows[0].name)}${
      b.rtl ? ' في الصدارة' : ' takes it'
    }</h2>` +
    '<div class="standings">' +
    rows
      .map(
        (r, i) =>
          `<div class="standing${i === 0 ? ' lead' : ''}"><span class="pos mono">${i + 1}</span>` +
          `<span class="sw" style="width:16px;height:16px;border-radius:50%;background:${r.color}"></span>` +
          `<span class="nm">${escapeHtml(r.name)}</span><span class="pts mono">${r.score}</span></div>`,
      )
      .join('') +
    '</div>' +
    `<div class="btn-row"><button class="btn ghost" id="fToPicker">${
      b.rtl ? 'اللوحة الأخرى' : 'Play the other board'
    }</button>` +
    `<button class="btn ghost" id="fHome2">${b.rtl ? 'القائمة الرئيسية' : 'Home'}</button></div>`;

  $('fToPicker').addEventListener('click', () => {
    show('screen-jpicker');
    renderPicker();
  });
  $('fHome2').addEventListener('click', () => show('screen-home'));
}

/* ---------------- wiring ---------------- */

export function initJeopardy(): void {
  $('revealBtn').addEventListener('click', () => {
    $('aText').hidden = false;
    $('revealBtn').hidden = true;
    buildAwardRow();
    $('awardRow').hidden = false;
    $('skipAwardBtn').hidden = false;
  });

  $('skipAwardBtn').addEventListener('click', () => {
    if (jeop.wager) award(jeop.wagerTeam, -jeop.wager);
    finishCell();
  });

  $('backToBoardBtn').addEventListener('click', () => {
    jeop.wager = 0;
    show('screen-board');
    renderBoard();
  });

  $('boardDoneBtn').addEventListener('click', () => show('screen-home'));
  $('boardSwitchBtn').addEventListener('click', () => {
    show('screen-jpicker');
    renderPicker();
  });
  $('finalBtn').addEventListener('click', () => renderFinal('wager'));
  $('finalHomeBtn').addEventListener('click', () => show('screen-home'));
  $('ddHomeBtn').addEventListener('click', () => {
    jeop.wager = 0;
    show('screen-board');
    renderBoard();
  });
  $('pickerHomeBtn').addEventListener('click', () => show('screen-home'));
}
