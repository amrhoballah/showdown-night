/** Shared types for every game. Question data files are checked against these. */

export type Lang = 'en' | 'ar';

/** One clue on a Jeopardy board. `v` is its point value. */
export interface Question {
  v: number;
  q: string;
  a: string;
}

export interface Category {
  name: string;
  qs: Question[];
}

/** A complete Jeopardy board: six categories plus its own Final Jeopardy. */
export interface Board {
  label: string;
  sub: string;
  cats: Category[];
  rtl: boolean;
  finalCat: string;
  finalQ: string;
  finalA: string;
}

/** One timed Outburst round: a category and the list revealed after the buzzer. */
export interface OutburstRound {
  cat: string;
  items: string[];
}

/** An emoji riddle. `h` is the category hint shown above the emoji. */
export interface EmojiRiddle {
  e: string;
  a: string;
  h: string;
}

/** A Wavelength spectrum: [what 1 means, what 10 means]. */
export type Spectrum = [string, string];

export type MafiaRoleName = 'mafia' | 'detective' | 'doctor' | 'civilian';

export interface MafiaRole {
  label: string;
  cls: string;
  desc: string;
}

export interface MafiaPlayer {
  name: string;
  role: MafiaRoleName;
  alive: boolean;
}

