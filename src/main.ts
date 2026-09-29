/** Entry point: wires the home screen launch buttons to each game module. */

import './styles.css';
import { $, show, confirmBox, escapeHtml, onScreenChange, type ScreenId } from './ui';
import { night, renderScoreboard, initScoreboard, loadNight, startNewNight } from './scoreboard';
import { startGame, endGame, gameInProgress, unevenTurns, type GameType } from './night';
import { initSetup, flashNeedMode, hasPlayers, refreshSetup, onNightCantGoOn } from './setup';
import { showContinue, hasNightToContinue } from './continue';
import {
  initJeopardy,
  startJeopardy,
  resumeJeopardy,
  stopJeopardyTimer,
  bothBoardsPlayed,
} from './games/jeopardy';
import {
  initOutburst,
  startOutburst,
  resumeOutburst,
  stopOutburstTimer,
} from './games/outburst';
import { initMafia, renderMafia, stopMafiaTimer } from './games/mafia';
import { initAct, startAct, resumeAct, stopActTimer } from './games/act';
import { initEmoji, startEmoji, resumeEmoji } from './games/emoji';
import { initWave, startWave, resumeWave } from './games/wavelength';
import { initResults, showResults, onEndGame, GAME_NAMES } from './results';

/** Every game that feeds the night standings: where it lives, how to start a
 *  new one, and how to go back into one in progress (at the step before
 *  anything mid-way, so no secret is shown twice and no timer carries on). */
const GAMES: Record<GameType, { screen: ScreenId; button: string; start(): void; resume(): void }> = {
  jeopardy: { screen: 'screen-jpicker', button: 'launchTrivia', start: startJeopardy, resume: resumeJeopardy },
  outburst: { screen: 'screen-outburst', button: 'launchOutburst', start: startOutburst, resume: resumeOutburst },
  act: { screen: 'screen-act', button: 'launchAct', start: startAct, resume: resumeAct },
  emoji: { screen: 'screen-emoji', button: 'launchEmoji', start: startEmoji, resume: resumeEmoji },
  wavelength: { screen: 'screen-wave', button: 'launchWave', start: startWave, resume: resumeWave },
};

/** Each launch button's own label, for when its game isn't in progress. */
const launchLabels = {} as Record<GameType, string>;

function stopAllTimers(): void {
  stopOutburstTimer();
  stopActTimer();
  stopJeopardyTimer();
  stopMafiaTimer();
}

/** "Resume …" on the card of the game in progress; the usual label elsewhere.
 *  Outburst's card stays visible in free-for-all, greyed out, with "Teams
 *  only" in place of its button. */
function renderLaunchCards(): void {
  const current = gameInProgress(night)?.type;
  (Object.keys(GAMES) as GameType[]).forEach((type) => {
    $(GAMES[type].button).textContent =
      type === current ? `Resume ${GAME_NAMES[type]}` : launchLabels[type];
  });
  const trivia = $('launchTrivia') as HTMLButtonElement;
  const noBoardsLeft = current !== 'jeopardy' && bothBoardsPlayed();
  if (noBoardsLeft) trivia.textContent = 'Both boards played tonight';
  trivia.disabled = noBoardsLeft;

  const teamsOnly = night.mode === 'ffa';
  $('launchOutburst').hidden = teamsOnly;
  $('outburstTeamsOnly').hidden = !teamsOnly;
  $('launchOutburst').closest('.launch-card')!.classList.toggle('unavailable', teamsOnly);
}

/** End the game in progress and show its result screens. They hand back to
 *  Home, or to `then` when ending it was the way into another game. */
function finishGame(then?: () => void): void {
  stopAllTimers();
  const ended = endGame(night);
  if (ended) showResults(ended, then);
}

function startNew(type: GameType): void {
  // Jeopardy's game starts when the host picks a board, in its picker.
  if (type !== 'jeopardy' && !startGame(night, type)) return;
  show(GAMES[type].screen);
  GAMES[type].start();
}

const turnsText = (n: number) => `${n} turn${n === 1 ? '' : 's'}`;

/** Who is short of turns, e.g. "El Captains: 2 turns, the others: 3." Names
 *  the one entity ahead when there is only one. */
function unevenMessage(u: NonNullable<ReturnType<typeof unevenTurns>>): string {
  const short = u.short.map((s) => `${escapeHtml(s.entity.name)}: ${turnsText(s.turns)}`).join(', ');
  const ahead = u.ahead.length === 1 ? escapeHtml(u.ahead[0].name) : 'the others';
  return `${short}, ${ahead}: ${u.most}.`;
}

/** Launch a game that awards points. It needs somebody to award them to.
 *  Launching the game in progress resumes it. Only one game is in progress at
 *  a time, so launching another asks to end the current one first; yes runs
 *  End game and its result screens, then starts the new game. */
async function launchScoring(type: GameType): Promise<void> {
  if (!hasPlayers()) {
    flashNeedMode();
    return;
  }
  const current = gameInProgress(night);
  if (!current) {
    startNew(type);
  } else if (current.type === type) {
    show(GAMES[type].screen);
    GAMES[type].resume();
  } else if (
    await confirmBox(
      `${GAME_NAMES[current.type]} is still in progress. End it and start ${GAME_NAMES[type]}?`,
      `End it and start ${GAME_NAMES[type]}`,
    )
  ) {
    finishGame(() => startNew(type));
  }
}

/** Clear the night and start a fresh one on Home. */
function clearNight(): void {
  stopAllTimers();
  startNewNight();
  refreshSetup();
  show('screen-home');
}

/** Ask before clearing the night; on yes, start a fresh one on Home. */
async function newNight(): Promise<boolean> {
  const yes = await confirmBox(
    'This clears tonight&rsquo;s standings and every finished game. Start a new night?',
    'Start a new night',
  );
  if (yes) clearNight();
  return yes;
}

/** Continue the saved night: back into the game in progress, at the step
 *  before whatever was mid-way, or Home. */
function continueNight(): void {
  const game = gameInProgress(night);
  if (!game) {
    show('screen-home');
    return;
  }
  show(GAMES[game.type].screen);
  GAMES[game.type].resume();
}

function main(): void {
  // First, before anything draws: every redraw saves, and would otherwise
  // overwrite the saved night with an empty one.
  loadNight();
  initScoreboard();
  initResults();
  initSetup();
  initJeopardy();
  initOutburst();
  initMafia();
  initAct();
  initEmoji();
  initWave();

  (Object.keys(GAMES) as GameType[]).forEach((type) => {
    const btn = $(GAMES[type].button);
    launchLabels[type] = btn.textContent ?? '';
    btn.addEventListener('click', () => launchScoring(type));
  });
  onScreenChange((id) => {
    if (id !== 'screen-home') return;
    renderLaunchCards();
    // Locks, Left controls and adding depend on whether a game is in progress.
    refreshSetup();
  });
  // A leave that would drop below 2 has already been confirmed as ending the night.
  onNightCantGoOn(clearNight);
  onEndGame(() => finishGame());

  // Mafia runs its own player list, so it never needs the scoreboard setup.
  $('launchMafia').addEventListener('click', () => {
    show('screen-mafia');
    renderMafia();
  });

  $('homeBtn').addEventListener('click', () => {
    stopAllTimers();
    show('screen-home');
  });

  $('endGameBtn').addEventListener('click', async () => {
    const game = gameInProgress(night);
    if (!game) return;
    const uneven = unevenTurns(night);
    const ok = uneven
      ? await confirmBox(`${unevenMessage(uneven)} End anyway?`, 'End anyway')
      : await confirmBox(`End ${GAME_NAMES[game.type]} now?`, 'End game');
    if (ok) finishGame();
  });

  $('newNightBtn').addEventListener('click', () => newNight());

  show('screen-home');
  renderScoreboard();
  if (hasNightToContinue()) showContinue(continueNight, () => newNight());
}

main();
