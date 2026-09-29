/** Entry point: wires the home screen launch buttons to each game module. */

import './styles.css';
import { $, show, confirmBox, type ScreenId } from './ui';
import { night, renderScoreboard, initScoreboard } from './scoreboard';
import { startGame, endGame, gameInProgress, type GameType } from './night';
import { initSetup, flashNeedMode, hasPlayers } from './setup';
import { initJeopardy, renderPicker } from './games/jeopardy';
import { initOutburst, renderOutburst, stopOutburstTimer } from './games/outburst';
import { initMafia, renderMafia, stopMafiaTimer } from './games/mafia';
import { initAct, renderAct, stopActTimer } from './games/act';
import { initEmoji, renderEmoji } from './games/emoji';
import { initWave, renderWave } from './games/wavelength';
import { initResults, showResults, GAME_NAMES } from './results';

function stopAllTimers(): void {
  stopOutburstTimer();
  stopActTimer();
  stopMafiaTimer();
}

/** End the game in progress and show its result screens, which hand back to
 *  Home. */
function finishGame(): void {
  stopAllTimers();
  const ended = endGame(night);
  if (ended) showResults(ended);
}

/** Launch a game that awards points. It needs somebody to award them to, and
 *  starts a game in progress of its type unless that type is already in
 *  progress. Only one game is in progress at a time, so launching another
 *  asks to end the current one first. */
async function launchScoring(type: GameType, render: () => void, screen: ScreenId): Promise<void> {
  if (!hasPlayers()) {
    flashNeedMode();
    return;
  }
  const current = gameInProgress(night);
  if (current && current.type !== type) {
    const yes = await confirmBox(
      `${GAME_NAMES[current.type]} is still in progress. End it and start ${GAME_NAMES[type]}?`,
      `End it and start ${GAME_NAMES[type]}`,
    );
    if (!yes) return;
    stopAllTimers();
    endGame(night);
  }
  if (!gameInProgress(night)) startGame(night, type);
  show(screen);
  render();
}

function main(): void {
  initScoreboard();
  initResults();
  initSetup();
  initJeopardy();
  initOutburst();
  initMafia();
  initAct();
  initEmoji();
  initWave();

  $('launchTrivia').addEventListener('click', () =>
    launchScoring('jeopardy', renderPicker, 'screen-jpicker'),
  );
  $('launchOutburst').addEventListener('click', () =>
    launchScoring('outburst', renderOutburst, 'screen-outburst'),
  );
  $('launchAct').addEventListener('click', () => launchScoring('act', renderAct, 'screen-act'));
  $('launchEmoji').addEventListener('click', () => launchScoring('emoji', renderEmoji, 'screen-emoji'));
  $('launchWave').addEventListener('click', () =>
    launchScoring('wavelength', renderWave, 'screen-wave'),
  );

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
    if (await confirmBox(`End ${GAME_NAMES[game.type]} now?`, 'End game')) finishGame();
  });

  show('screen-home');
  renderScoreboard();
}

main();
