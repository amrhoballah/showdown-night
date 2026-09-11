# Showdown Night

Six party games driven from one screen — built for a living room, a TV, and about a dozen people. One laptop runs the show; everybody else just watches and shouts. No second devices, no accounts, no network calls at runtime.

Question content is deliberately mixed: mostly global general knowledge, with a run of material an Egyptian crowd will catch (Mo Salah, the Ahly–Zamalek derby, koshary, Cairo traffic), plus a complete second Jeopardy board written natively in Arabic.

## The games

| Game | Players | Runtime | What it is |
|---|---|---|---|
| **Jeopardy** | 2–4 teams | ~40 min | Two independent boards, English and Arabic, 30 clues each. Hidden Daily Double with wagering, plus a Final Jeopardy where every team bets part of its score. |
| **Outburst** | 2–4 teams | ~30 min | Nine rounds. A hidden category, a 60-second shout-out, then the list reveals and you tally what you actually said. |
| **Mafia** | 6–16 players | ~40 min | The screen narrates. Pass the laptop once for secret roles, then it runs night phases, the day timer, the vote, and the win check. |
| **Act It Out** | 2–4 teams | ~15 min | The guesser sits facing away; everyone else sees the word and has 60 seconds to act it out. |
| **Emoji Riddles** | any | ~15 min | 28 emoji puzzles across films, food, places and people. |
| **Wavelength** | 2–4 teams | ~20 min | A 1–10 spectrum. One player secretly sees the number and gives a one-word clue; their team argues, then picks a number. |

Scores from every game except Mafia feed one running scoreboard pinned to the top of the screen.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
```

For game night, `npm run build && npm run preview` and open that on the machine plugged into the TV. Fullscreen the browser (F11, or ⌃⌘F on macOS) — the layout is built for a big screen at a distance, and everything scales down to phone width too.

```bash
npm run build      # typecheck, then bundle to dist/
npm run typecheck  # types only
```

## Setting up a night

Pick a split on the home screen first — 2, 3, or 4 teams, or free-for-all where you add players by name. Team names are editable; the defaults are just a starting point. Free-for-all names also get picked up automatically by Mafia when you deal roles, so you only type them once.

Mafia is the only game that ignores the scoreboard, by design: points mean nothing in a social deduction game, so it tracks its own players and win condition instead.

## Adding your own questions

All content lives in `src/data/` and is typechecked against the interfaces in `src/types.ts`, so a malformed question fails `npm run build` rather than breaking mid-party.

- `jeopardy.en.ts` / `jeopardy.ar.ts` — six categories of five clues each. Values run 100–500 and the difficulty is meant to climb with them; the 500s should be genuinely hard.
- `boards.ts` — board metadata and the Final Jeopardy question for each language.
- `outburst.ts` — a category plus ten example answers. The list is a guide, not a rulebook; award anything in the same spirit.
- `act.ts`, `emoji.ts`, `spectra.ts`, `mafia.ts` — prompts, riddles, spectrum pairs, role descriptions.

Adding a category to a board is just another entry in the array — the grid sizes itself, though the CSS assumes six columns, so changing that count means touching `.board` in `styles.css` too.

## Deploying

Pushing to `main` builds and publishes to GitHub Pages via `.github/workflows/deploy.yml`. Enable it once under **Settings → Pages → Source → GitHub Actions**. The workflow passes the repo name as `VITE_BASE` so assets resolve under `/<repo-name>/`; local builds default to `/`.

## License

MIT.
