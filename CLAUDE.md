# Working in this repo

Context for Claude Code sessions. This project started as a single-file HTML artifact built in one conversation and was ported to Vite + TypeScript; the decisions below were made deliberately during that conversation, so please don't silently reverse them.

## What this is

A party game console for one shared screen. The operating assumption behind every design choice: **one laptop plugged into a TV, twelve people in the room, nobody else holding a device.** That constraint explains most of what looks unusual here.

- Text is large because it's read from across a room, not from 50cm away.
- Anything secret (a Mafia role, a Wavelength target, a Jeopardy Daily Double) is handled by physically passing the laptop with an explicit "hide the screen" step, because there's no second device to send it to.
- Games that need one player *not* to see the screen (Act It Out) are inverted: the crowd sees the word and the single guesser faces away. A conventional Heads Up would be unplayable on a shared screen.
- Outburst hides its category until the timer starts, for the same reason.

When adding a game, apply the same test: can twelve people play it with one screen everyone can see and no private channels?

## Architecture

Plain TypeScript, no framework. Vite for dev server and bundling.

```
index.html          all markup — every screen is a <section> that starts hidden
src/main.ts         entry point; launching, resuming and ending games, New night
src/ui.ts           $ / show / escapeHtml / shuffle / onClickAll / confirmBox / toast
src/night.ts        the Night: entities, games, placement, standings, saved format (pure, tested)
src/night.test.ts   Vitest tests through the Night's public operations
src/weights.ts      the per-game-type weights, meant to be hand-tuned
src/scoreboard.ts   the one Night instance, saving it, and the sticky scoreboard row
src/results.ts      the two end-of-game result screens
src/continue.ts     the "Continue tonight?" card shown on load
src/setup.ts        home screen setup UI: mode, names, Left / Back, Add team
src/types.ts        every content interface
src/games/*.ts      one module per game, each owning its own screen state
src/data/*.ts       all question content, typed against src/types.ts
src/styles.css      all styling, one file, CSS custom properties
```

Conventions worth matching:

- **Screens** are declared in `SCREENS` in `ui.ts` and switched with `show('screen-x')`. A new screen means a `<section id="screen-x" hidden>` in `index.html` plus an entry in that array.
- **Game modules** export `init*()`, `start*()` and `resume*()`, registered in `GAMES` in `main.ts`. `init*` attaches the listeners that live for the whole session (home buttons); `start*` begins a new game; `resume*` goes back into the game in progress at the step *before* anything mid-way, so a secret is never shown twice and a timer never carries on. Rendering rebuilds the screen's `innerHTML` and re-attaches listeners for what it just drew. Re-rendering the whole card on each step is intentional — it keeps each phase's markup readable in one place and the DOM here is tiny.
- **The Night is the only shared state** (`night.ts`, vocabulary in `CONTEXT.md`). A game module keeps its own screen state (decks, phases, timers) and changes the night only through its operations, by **entity id**, never by position in a list — then calls `renderScoreboard()`, which redraws the row and saves the night. Keep `night.ts` free of DOM access; it is the test seam.
- **Natural finishes** end the game without a confirm via `endGameNow()` from `results.ts`; End game in the top bar confirms.
- **Always `escapeHtml()`** anything the user typed (team and player names) before putting it in `innerHTML`. Question data is ours and may contain intentional markup entities.
- Timers are `window.setInterval` handles stored in module state, with a `stop*Timer()` export called when leaving the screen. Forgetting this leaves a timer ticking into a dead DOM.

## Game rules that are decisions, not bugs

- **Mafia is not part of the night.** It tracks its own players and win condition, earns no placement points and isn't saved. Points are meaningless in social deduction; it only borrows free-for-all names to pre-fill its list.
- **Games convert into placement points, not raw points.** When a game ends, each entity's game score becomes place points (5 / 3 / 1) plus a share of a 10-point pie, times the game type's weight, so a Jeopardy board can't outweigh the night by point scale. Night standings are always derived from finished games' game scores, never stored. The rules and worked cases live in `.scratch/even-scoring/spec.md`; the tests hold them.
- **Weights follow each game's expected length** (Emoji 1×, Act It Out and Wavelength 1.5×, Outburst 2×, Jeopardy 4×), not its stakes or difficulty, and only change by editing `weights.ts`.
- **One game in progress at a time.** Leaving via Home keeps it in progress; launching another asks to end it first.
- **Each Jeopardy board is its own game, played once a night.** A played board can't be restarted until New night, because its clues and Daily Double are known.
- **Outburst is one team per round and teams-only**, and stops at the last full lap so every team gets the same number of turns.
- **Setup changes never rewrite results.** From the first finished game, the mode is locked; latecomers join at 0; someone who leaves is marked Left and keeps their past results.
- **A wrong answer on a normal Jeopardy clue costs nothing.** This was chosen to keep the game friendly. But the **Daily Double and Final Jeopardy wagers do swing both ways** — a wager with no downside isn't a wager. That asymmetry is intentional.
- **The Daily Double never hides in the 100 row** (`pickDailyDouble`), so it always carries a real stake.
- **Wavelength is a discrete 1–10 scale**, not a continuous dial. It was a dial first and was changed: a room can argue about "that's a 7" in a way it can't argue about a slider position. Scoring is 4 / 2 / 1 for exact / one off / two off.
- **Final Jeopardy wagers are capped at the team's current score** and the category is shown before the question, which is what makes a comeback possible.

## Content rules

Question data lives only in `src/data/` and is typechecked, so `npm run build` catches a malformed entry before a party does.

- **Questions must not be self-answering.** An earlier draft asked things like "what's the Egyptian dish of rice, lentils and macaroni?" — that's a definition with the answer in the prompt, not a question. Difficulty should climb genuinely from 100 to 500, and the 500s should be hard enough that a room of adults argues.
- **Accuracy matters more than volume.** Every fact here was picked because it's verifiable. If you're not confident in a fact, don't add it.
- **The Arabic board is native, not translated.** Its categories (أكمل المثل, طرب وموسيقى, سينما ودراما) exist because they only work in Arabic. Don't replace them with translations of the English board, and don't translate the English board into Arabic — they're deliberately separate question pools.
- Arabic content needs `dir="rtl"` and the `.ar` class, which switches to the Cairo typeface. `renderBoard()` and `showQuestion()` in `jeopardy.ts` show the pattern.
- Keep the content mix as it is: mostly global general knowledge, with a meaningful run of Egypt-specific material. It was rebalanced to this on purpose after a fully Egypt-themed draft.

## Testing

The scoring and night rules are tested through the Night's public operations; the screens are checked by hand. Before pushing:

```bash
npm test          # Vitest: placement, standings, turns, setup rules, the saved night
npm run build     # typecheck + bundle
npm run preview   # then click through the games you touched
```

Worth verifying by hand after changes: the Arabic board and its result screens render RTL in Cairo, a Daily Double correctly adds *and* subtracts, Final Jeopardy settles every team, a reload offers "Continue tonight?" and resumes where it was, and no timer keeps running after you leave a screen or end a game.
