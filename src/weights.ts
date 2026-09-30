/** How much each game type counts in the night standings.
 *
 *  A weight multiplies a game's placement points (place points plus pie
 *  share), so a 4× game is worth up to 60. Weights follow each game's
 *  expected length, roughly minutes ÷ 10 with Emoji as the 1× unit - not its
 *  stakes or difficulty. Both Jeopardy boards share one weight.
 *
 *  Edit freely to retune a night; nothing adjusts these at runtime.
 */

import type { GameType } from './night';

export const WEIGHTS: Record<GameType, number> = {
  emoji: 1, //       ~10 min, 28 riddles
  act: 1.5, //       ~15 min
  wavelength: 1.5, // ~15 min
  outburst: 2, //    ~18 min, 9 rounds of 60 s
  jeopardy: 4, //    ~35-40 min, 30 clues plus Final
};
