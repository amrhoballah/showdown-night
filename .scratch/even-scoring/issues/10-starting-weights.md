# What are the starting weights per game type?

Type: grilling
Status: resolved
Assignee: Hussein Rzikana
Blocked by: 08

## Question

Each game type has a fixed weight in a tunable config ("Are all games worth the same?"). What is each game type's starting weight (Jeopardy, Emoji, Wavelength, Act It Out, Outburst)? And what does a weight scale: the whole placement points (place points and pie share together), or only the pie? The formula is place points 5 / 3 / 1 plus a 10-point pie (see "How do game scores convert into placement points?"), so a 1× game is worth at most 15. Do weighted points need rounding back to whole numbers, e.g. with a ×1.5 weight?

## Answer

**Weights set from expected length, applied to the whole placement points, with the weighted total rounded to a whole number.** Resolved by grilling, 2026-09-28.

- **What a weight scales:** the whole placement points (place points plus pie share). A 4× game is worth up to 60.
- **Rounding:** weights can be any number. Each entity's weighted placement points are rounded to the nearest whole number, with halves rounding up. Rounding never flips an order: a bigger total can tie a smaller one after rounding, but never drop below it.
- **What a weight measures:** a game type's expected length, roughly expected minutes ÷ 10, with Emoji as the 1× unit. Not stakes or skill.
- **Starting weights:**

  | Game type | Expected length | Weight |
  |---|---|---|
  | Emoji | ~10 min (28 riddles) | 1× |
  | Act It Out | ~15 min | 1.5× |
  | Wavelength | ~15 min | 1.5× |
  | Outburst | ~18 min (9 rounds of 60 s) | 2× |
  | Jeopardy | ~35–40 min (30 clues plus Final) | 4× |

  The English and Arabic Jeopardy boards are one game type with one weight.
- **Fixed, never automatic:** the weights live in a config file that's easy to edit. Nothing adjusts them at runtime, not rounds or turns played, how long a game actually ran, team mode vs free-for-all, or anything else. Retuning is a manual edit by whoever runs the night.

Rejected: weighting only the pie (a narrow Jeopardy win would count the same as a narrow Emoji win); whole-number weights only (too coarse); weighting by stakes or skill (hard to agree on or tune); a Jeopardy weight compressed to 3× so one board can't decide the night (that departs from length, and can be a later manual tune); separate weights for free-for-all.
