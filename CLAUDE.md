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
src/main.ts         entry point; wires launch buttons to game modules
src/ui.ts           $ / show / escapeHtml / shuffle / onClickAll helpers
src/scoreboard.ts   shared state: teams or free-for-all, scores, award()
src/setup.ts        home screen setup UI
src/types.ts        every content interface
src/games/*.ts      one module per game, each owning its own local state
src/data/*.ts       all question content, typed against src/types.ts
src/styles.css      all styling, one file, CSS custom properties
```

Conventions worth matching:

- **Screens** are declared in `SCREENS` in `ui.ts` and switched with `show('screen-x')`. A new screen means a `<section id="screen-x" hidden>` in `index.html` plus an entry in that array.
- **Game modules** export a `render*()` and an `init*()`. `init*` attaches the listeners that live for the whole session (home buttons); `render*` rebuilds the screen's `innerHTML` and re-attaches listeners for what it just drew. Re-rendering the whole card on each step is intentional — it keeps each phase's markup readable in one place and the DOM here is tiny.
- **Game state** is module-local, not global. Only the scoreboard is shared.
- **Always `escapeHtml()`** anything the user typed (team and player names) before putting it in `innerHTML`. Question data is ours and may contain intentional markup entities.
- Timers are `window.setInterval` handles stored in module state, with a `stop*Timer()` export called when leaving the screen. Forgetting this leaves a timer ticking into a dead DOM.

## Game rules that are decisions, not bugs

- **Mafia does not use the shared scoreboard.** It tracks its own players and win condition. Points are meaningless in social deduction. Don't "fix" this by wiring it into `award()`.
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

There's no test suite. The practical check before pushing:

```bash
npm run build     # typecheck + bundle
npm run preview   # then click through the games you touched
```

Worth verifying by hand after changes: the Arabic board renders RTL with the right font, a Daily Double correctly adds *and* subtracts, Final Jeopardy settles every team, and no timer keeps running after you leave a screen.
