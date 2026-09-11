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
] as const;

export type ScreenId = (typeof SCREENS)[number];

/** Element lookup by id. Throws loudly rather than returning null, so a typo in
 *  an id surfaces immediately instead of failing silently mid-game. */
export function $(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el;
}

/** Show one screen and hide the rest. */
export function show(id: ScreenId): void {
  SCREENS.forEach((s) => {
    $(s).hidden = s !== id;
  });
  window.scrollTo(0, 0);
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
