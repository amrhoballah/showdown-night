# Brag Plan: Showdown Night

## What is this app?
A party-game console for one TV and a room of twelve: six games (bilingual Jeopardy, Outburst, Mafia, Act It Out, Emoji Riddles, Wavelength) run from a single laptop, with one shared scoreboard and no second devices.

## The angle
**Your living room is the game show.** Showdown Night is built on a constraint most party apps ignore — one screen, everyone can see it, nobody else holds a phone. The video plays like a TV game-show intro for a living room: big amber type on the app's own deep-purple stage, the real Jeopardy board, the real Daily Double, a native Arabic board, and a room-arguing Wavelength pick. The brag is the constraint itself: *zero phones* and it still runs six games.

## Hook (first 2-3 seconds)
Three counters slam in on the dark stage, one per beat, in Unbounded:
**1 TV · 12 PLAYERS · 0 PHONES** — the "0 PHONES" lands last and hardest (amber, slight overshoot). The narration says it differently ("Twelve people, one TV, and not a single phone out.") so the voice doesn't just read the screen.

## Key moments (the middle)
- **The six launch cards** fanning in with their own glow colors (amber, green, red, violet, yellow, green) under the SHOWDOWN NIGHT wordmark with the amber dot.
- **The Jeopardy board**: six real categories (Movies & TV, Music, Football, Geography, History, Science & Tech), a cursor taps Football · 400, the cell flips to the amber **DAILY DOUBLE** banner.
- **The Arabic board** wipes in right-to-left in Cairo type: أكمل المثل · سينما ودراما · طرب وموسيقى — with a real clue: «القرد في عين أمه ...».
- **Rapid-fire trio**: Outburst timer ticking down on "Things an Uber/Careem Driver Says in Cairo Traffic" → emoji riddle 🍚🍝🧅🍅 resolves to "Koshary" → Wavelength numpad, **7** tapped, target 7, **+4**.

## Outro / punchline
The scoreboard chips tick up in team colors, then everything clears to the wordmark and the app's own home headline: **"Pick sides, then pick a game."**

## User flow worth showing
Home: pick how you're splitting up → launch Jeopardy → tap a clue value → Daily Double / wager → reveal → points land on the shared scoreboard in the top bar. The board tap → Daily Double → score chip ticking is the centerpiece.

## Tone
- Preset: default
- Creative direction: living-room game-show intro
- Interpretation: warm and playful, a touch of TV-show hype; fast cuts and snappy entrances but every label held long enough to read from the couch. No SaaS language; the copy is the app's own.

## Format: landscape — 1920x1080
## Duration: 24.0s (set by the generated voiceover)

## Visual identity (from the project)
- Background: `#14121f` (raised `#1c1930`, `#241f3d`, line `#352f52`)
- Accent: `#ffb649` (accent ink `#2a1a00`); good `#4ad6a6`; alert `#ff6b6b`; teams `#ff6b6b #4ad6a6 #b98eff #ffd166`
- Text: `#f3efe8` (dim `#b6aed1`, faint `#8279a1`)
- Display font: Unbounded (800/900)
- Body font: Work Sans; mono: IBM Plex Mono; Arabic: Cairo
- Strongest visual element: the Jeopardy grid with amber mono values + the launch cards' radial glow corners

## Share copy (draft)
Built a party-game console for one TV and twelve people — six games, a real Daily Double, a native Arabic Jeopardy board, and zero phones.

## Voiceover script
Voice: Kokoro `af_heart` via `npx hyperframes tts`. One clip per scene so each line can sit on its scene. ~55 words.

1. (Hook) "Twelve people. One TV. Not a single phone out."
2. (Reveal) "This is Showdown Night: six party games that run off one laptop."
3. (Jeopardy) "Jeopardy, with a Daily Double that can actually cost you."
4. (Arabic) "Plus a second board, written in Arabic from scratch."
5. (Trio) "Sixty-second shout-outs. Emoji riddles. And Wavelength, where the whole room argues whether that's a seven."
6. (Outro) "Pick sides. Then pick a game."

## Audio direction
- Role: warm, punchy bed under a voiceover
- Music: `happy-beats-business-moves-vol-10-by-ende-dot-app.mp3` (compact, punchy, 110 BPM)
- Music treatment: fade in over 0.4s at ~0.32, duck to ~0.13 under each voice line, lift back up for the final wordmark, fade out over the last ~1s
- Music cue guidance: preset `assets/music/cues/happy-beats-business-moves-vol-10-by-ende-dot-app.music-cues.json`, 109.96 BPM. Strong cues 20.19s / 20.74s / 22.92s — lock the final wordmark reveal to ~20.19s if the voice timing allows. Beat grid ~0.55s apart: hook counters on consecutive beats (0.27 / 0.82 / 1.37 — accents only; the full set then holds ≥1.2s). Launch cards on every beat is fine because the six names hold together afterward.
- Audio-reactive treatment: subtle; bass energy makes the launch-card glows and the wordmark's amber dot halo breathe. No waveform/equalizer visuals.
- SFX posture: moderate, motion-matched
- Audio-coupled moments: hook counter slams; card deal; cursor click on the 400 cell; Daily Double reveal hit; timer ticks; numpad tap; score chip ticks; final wordmark
- Restraint rule: SFX never step on voice consonants — keep them under the VO, and no stacked hits during narration

## Storyboard

### Scene 1 — Hook — 3.5s (0.0–3.5)
Dark stage. "1 TV", "12 PLAYERS", "0 PHONES" slam in left to right; "0 PHONES" in amber, largest.
Sequential/interaction: yes — three counters arrive one by one, full set holds ≥1.2s
Audio intent: grab attention, game-show energy
Audio-coupled idea: a soft impact per counter, heavier on "0 PHONES"
Music: bed fades in
Transition mood: hard → Scene 2

### Scene 2 — Reveal — 4.3s (3.5–7.8)
Top bar wordmark "SHOWDOWN NIGHT" with the amber dot, then the six launch cards (Jeopardy, Outburst Rounds, Mafia, Act It Out, Emoji Riddles, Wavelength) deal in with their glow colors and tags ("Game 1 · 60 questions · EN + عربي" …).
Sequential/interaction: yes — six cards deal in one per beat, then hold together ≥1.5s
Audio intent: reveal, variety
Audio-coupled idea: card-deal sounds on first and last card
Transition mood: clean slide → Scene 3

### Scene 3 — Jeopardy board + Daily Double — 3.1s (7.8–10.9)
The English board: six category heads, 30 amber mono cells. A cursor moves to Football · 400 and clicks; the cell pops and the stage flips to the amber **DAILY DOUBLE** banner with a wager row ("Wager — up to your score").
Sequential/interaction: yes — simulated cursor click
Audio intent: suspense → payoff
Audio-coupled idea: click on tap, announcement hit on DAILY DOUBLE
Transition mood: wipe (right-to-left) → Scene 4

### Scene 4 — Arabic board — 2.9s (10.9–13.8)
RTL board in Cairo: أكمل المثل · سينما ودراما · طرب وموسيقى · جغرافيا عربية · تاريخ; then a question card: «القرد في عين أمه ...» with answer «غزال» appearing in green.
Sequential/interaction: yes — question then answer reveal
Audio intent: warm, a small delight
Audio-coupled idea: soft drop on the answer
Transition mood: hard → Scene 5

### Scene 5 — Rapid trio — 6.4s (13.8–20.2: Outburst 2.2s, Emoji 1.9s, Wavelength 2.3s)
Three quick panels, each held ≥1.4s:
(a) Outburst: "Things an Uber/Careem Driver Says in Cairo Traffic" with the mono timer counting 60 → 57, low answer chips "Fi zahma", "Ana ablak".
(b) Emoji: 🍚🍝🧅🍅 → "Koshary".
(c) Wavelength: "Overrated ↔ Underrated", numpad 1–10, 7 tapped (amber), target 7 revealed, **+4** in green.
Sequential/interaction: yes — timer ticks, numpad tap
Audio intent: momentum
Audio-coupled idea: timer ticks, tap click on 7, chip sound on +4
Transition mood: quick cuts → Scene 6

### Scene 6 — Scoreboard + outro — 3.8s (20.2–24.0)
Score chips (team colors) tick up; then clear to SHOWDOWN NIGHT wordmark + "Pick sides, then pick a game."
Sequential/interaction: yes — score counters
Audio intent: celebration, land it
Audio-coupled idea: chips stack on count-up, bell on wordmark
Transition mood: soft → end

**Music mood for this video:** upbeat
**Audio summary:** a punchy bed that ducks under a warm conversational voice, with game-show hits on the counters, Daily Double and wordmark, and a clean fade out.
