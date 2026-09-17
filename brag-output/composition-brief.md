# Hyperframes Composition Brief: Showdown Night

## Objective
Create a short launch-style brag video for Showdown Night, narrated.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 24.0s (set by the voiceover)

## Source Material
- Project root: `showdown-night/`
- Primary files read: `index.html`, `src/styles.css`, `README.md`, `package.json`, `src/data/*.ts`, `src/games/wavelength.ts`, `src/games/act.ts`
- Product name: Showdown Night
- Tagline / strongest claim: "Six party games for one TV and a room full of people" / "Pick sides, then pick a game."
- Key UI to recreate: top-bar wordmark with amber dot; six launch cards with radial glow; English Jeopardy board (six categories × 100–500); DAILY DOUBLE banner; Arabic RTL board in Cairo; Outburst timer + category; emoji riddle; Wavelength numpad + reveal; score chips.
- Copy that must appear verbatim:
  - SHOWDOWN NIGHT
  - Pick sides, then pick a game.
  - Jeopardy · Outburst Rounds · Mafia · Act It Out · Emoji Riddles · Wavelength
  - DAILY DOUBLE
  - أكمل المثل · سينما ودراما · طرب وموسيقى
  - «القرد في عين أمه ...» → غزال
  - Things an Uber/Careem Driver Says in Cairo Traffic
  - 🍚🍝🧅🍅 → Koshary
  - Overrated ↔ Underrated

## Creative Direction
- Tone preset: default
- Creative direction: living-room game-show intro
- Interpretation: snappy entrances, confident holds, warm hits; everything readable from the couch.
- Angle: the constraint is the brag — one screen, twelve people, zero phones, and it still runs six games including a native Arabic Jeopardy board.
- Hook: 12 PLAYERS · 1 TV · 0 PHONES slam in with the voice.
- Outro / punchline: SHOWDOWN NIGHT wordmark + "Pick sides, then pick a game."
- Avoid: generic SaaS language, abstract filler, redesigning the app's look.

## Visual Identity
- Background: `#14121f` (raised `#1c1930` / `#241f3d`, line `#352f52`)
- Text: `#f3efe8` (dim `#b6aed1`, faint `#8279a1`)
- Accent: `#ffb649`; good `#4ad6a6`; alert `#ff6b6b`; violet `#b98eff`; yellow `#ffd166`
- Display font: Unbounded (local woff2)
- Body font: Work Sans; mono IBM Plex Mono; Arabic Cairo (local woff2, arabic subset)
- Visual references: `.launch-card::before` radial glow, `.cell` amber mono values, `.dd-banner` glow, `.numpad button.chosen`, `.score-chip`

## Storyboard
Contract: `brag-output/brag-plan.md`. Timings locked to the voice clips:

1. Hook — 0.0–3.5s — 12 PLAYERS / 1 TV / 0 PHONES (vo1 at 0.15)
2. Reveal — 3.5–7.8s — wordmark, six launch cards (vo2 at 3.6)
3. Jeopardy — 7.8–10.9s — board, cursor clicks Football 400, DAILY DOUBLE (vo3 at 7.9)
4. Arabic board — 10.9–13.8s — RTL board + proverb clue + answer (vo4 at 11.0)
5. Rapid trio — 13.8–20.2s — Outburst (→15.6), Emoji (→17.8), Wavelength (→20.2) (vo5 at 13.9)
6. Outro — 20.2–24.0s — score chips + wordmark + tagline (vo6 at 20.6)

## Audio
- Audio role: punchy bed under narration
- Audio arc: bed fades in low under the voice, lifts after the last line, fades out
- Music: `assets/music/happy-beats-business-moves-vol-10-by-ende-dot-app.mp3`
- Music treatment: ~0.15 under voice (0–22.4s), up to ~0.34 at 22.4s, fade to 0 by 23.95s
- Music cue guidance: `assets/music/cues/happy-beats-business-moves-vol-10-by-ende-dot-app.music-cues.json`; lock wordmark to strong cue 20.19s; card deal on beats from 5.19s
- Audio-reactive treatment: subtle; bass drives launch-card glow and amber dot halo; pre-extracted to `assets/audio-data.js`
- Voiceover: `assets/vo/vo1..6.wav`, Kokoro `af_heart`
- Audio-coupled moments: hook counters (soft impacts), card deal (card slide), cursor click, DAILY DOUBLE (bell), Arabic answer (drop), numpad tap (click), +4 (chips), score ticks (chips stack), wordmark (bell)
- SFX selection guidance: low-HF-risk picks from `sfx-analysis.md`; SFX under VO at 0.5–0.7
- Audio files: copied into `brag-output/composition/assets/`
