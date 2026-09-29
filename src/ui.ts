/** DOM helpers and screen switching, shared by every game module. */

/** All top-level screen ids. Exactly one is visible at a time. */
export const SCREENS = [
  'screen-home',
  'screen-jpicker',
  'screen-board',
  'screen-dd',
  'screen-question',
  'screen-final',
  'screen-outburst',
  'screen-mafia',
  'screen-act',
  'screen-emoji',
  'screen-wave',
  'screen-result',
] as const;

export type ScreenId = (typeof SCREENS)[number];

/** Element lookup by id. Throws loudly rather than returning null, so a typo in
 *  an id surfaces immediately instead of failing silently mid-game. */
export function $(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el;
}

let current: ScreenId = 'screen-home';
const screenListeners: ((id: ScreenId) => void)[] = [];

/** Show one screen and hide the rest. */
export function show(id: ScreenId): void {
  SCREENS.forEach((s) => {
    $(s).hidden = s !== id;
  });
  current = id;
  window.scrollTo(0, 0);
  screenListeners.forEach((fn) => fn(id));
}

export function currentScreen(): ScreenId {
  return current;
}

/** Run `fn` after every screen change. */
export function onScreenChange(fn: (id: ScreenId) => void): void {
  screenListeners.push(fn);
}

let toastTimer = 0;

/** Show a short message at the bottom of the screen, e.g. why a correction
 *  was refused. `message` may contain entities but never user text. */
export function toast(message: string): void {
  const el = $('toast');
  el.innerHTML = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    el.hidden = true;
  }, 3000);
}

/** Ask the host a yes/no question in a full-screen card, instead of a browser
 *  dialog that would be unreadable from across the room. Resolves true for
 *  yes; Esc, the cancel button or clicking outside the card resolve false. */
export function confirmBox(message: string, yesLabel: string, noLabel = 'Cancel'): Promise<boolean> {
  const box = $('confirmBox');
  box.innerHTML =
    '<div class="confirm-card card" role="dialog" aria-modal="true" aria-labelledby="confirmMsg">' +
    `<h2 id="confirmMsg">${message}</h2>` +
    '<div class="btn-row">' +
    `<button class="btn ghost" id="confirmNo">${noLabel}</button>` +
    `<button class="btn" id="confirmYes">${yesLabel}</button>` +
    '</div></div>';
  box.hidden = false;
  $('confirmYes').focus();

  return new Promise((resolve) => {
    const done = (answer: boolean) => {
      box.hidden = true;
      box.innerHTML = '';
      document.removeEventListener('keydown', onKey);
      resolve(answer);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') done(false);
    };
    document.addEventListener('keydown', onKey);
    $('confirmYes').addEventListener('click', () => done(true));
    $('confirmNo').addEventListener('click', () => done(false));
    // Assigned, not added: the backdrop outlives each confirm.
    box.onclick = (e) => {
      if (e.target === box) done(false);
    };
  });
}

/** Escape text before it goes into innerHTML. Question data is ours, but team
 *  and player names are typed by the user at the party. */
export function escapeHtml(s: unknown): string {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      (({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }) as Record<string, string>)[c],
  );
}

/** Fisher-Yates. Returns a new array; does not mutate the input. */
export function shuffle<T>(a: readonly T[]): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Attach a click handler to every element matching `sel` inside `root`,
 *  passing the element so handlers can read its data attributes. */
export function onClickAll(
  root: HTMLElement,
  sel: string,
  fn: (el: HTMLElement) => void,
): void {
  root.querySelectorAll<HTMLElement>(sel).forEach((el) => {
    el.addEventListener('click', () => fn(el));
  });
}

/** Read a data attribute as a number. */
export function dataNum(el: HTMLElement, key: string): number {
  return Number(el.getAttribute(`data-${key}`));
}
