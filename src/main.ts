/** Entry point: wires the home screen launch buttons to each game module. */

import './styles.css';
import { $, show } from './ui';
import { initSetup, flashNeedMode, hasPlayers } from './setup';
import { initJeopardy, renderPicker } from './games/jeopardy';
import { initOutburst, renderOutburst, stopOutburstTimer } from './games/outburst';
import { initMafia, renderMafia, stopMafiaTimer } from './games/mafia';
import { initAct, renderAct, stopActTimer } from './games/act';
import { initEmoji, renderEmoji } from './games/emoji';
import { initWave, renderWave } from './games/wavelength';

function stopAllTimers(): void {
  stopOutburstTimer();
  stopActTimer();
  stopMafiaTimer();
}

/** Games that award points need somebody to award them to. Mafia does not. */
function launchScoring(render: () => void, screen: Parameters<typeof show>[0]): void {
  if (!hasPlayers()) {
    flashNeedMode();
    return;
  }
  show(screen);
  render();
}

function main(): void {
  initSetup();
  initJeopardy();
  initOutburst();
  initMafia();
  initAct();
  initEmoji();
  initWave();

  $('launchTrivia').addEventListener('click', () => launchScoring(renderPicker, 'screen-jpicker'));
  $('launchOutburst').addEventListener('click', () => launchScoring(renderOutburst, 'screen-outburst'));
  $('launchAct').addEventListener('click', () => launchScoring(renderAct, 'screen-act'));
  $('launchEmoji').addEventListener('click', () => launchScoring(renderEmoji, 'screen-emoji'));
  $('launchWave').addEventListener('click', () => launchScoring(renderWave, 'screen-wave'));

  // Mafia runs its own player list, so it never needs the scoreboard setup.
  $('launchMafia').addEventListener('click', () => {
    show('screen-mafia');
    renderMafia();
  });

  $('homeBtn').addEventListener('click', () => {
    stopAllTimers();
    show('screen-home');
  });

  show('screen-home');
}

main();
