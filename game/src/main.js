// main.js — boot, loop animasi, layar (judul/pause/menang/ulang),
// input mouse + keyboard, dan wiring tombol HUD.
import { SCENE_W, SCENE_H } from './config.js';
import { createGame, bestScore } from './game.js';
import { updateHud } from './render.js';
import { audio } from './audio.js';
import { applyShotMode } from './shots.js';

const canvasL = document.getElementById('panel-left');
const canvasR = document.getElementById('panel-right');
canvasL.width = SCENE_W;
canvasL.height = SCENE_H;
canvasR.width = SCENE_W;
canvasR.height = SCENE_H;

const game = createGame(canvasL, canvasR);
const state = game.state;

const overlays = {
  start: document.getElementById('overlay-start'),
  paused: document.getElementById('overlay-paused'),
  levelClear: document.getElementById('overlay-clear'),
  levelFail: document.getElementById('overlay-fail'),
  win: document.getElementById('overlay-win'),
};

function showOverlay() {
  for (const [name, el] of Object.entries(overlays)) {
    if (!el) continue;
    el.classList.toggle('hidden', state.screen !== name);
  }
  const clearTitle = document.getElementById('clear-title');
  if (clearTitle) {
    clearTitle.textContent = state.levelIndex >= 2
      ? 'Final level complete!'
      : `${state.levels[state.levelIndex].title} complete!`;
  }
  const clearScore = document.getElementById('clear-score');
  if (clearScore) clearScore.textContent = `Score ${state.score} — time bonus added.`;
  const winScore = document.getElementById('win-score');
  if (winScore) winScore.textContent = `Final score: ${state.score}`;
  const winBest = document.getElementById('win-best');
  if (winBest) winBest.textContent = `Best score: ${state.best}`;
  const startBest = document.getElementById('start-best');
  if (startBest) {
    const b = bestScore();
    startBest.textContent = b > 0 ? `Your best score: ${b}` : 'No score yet — be the first!';
  }
}

function bindButtons() {
  const on = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => { audio.unlock(); fn(); });
  };
  on('btn-start', () => game.startGame());
  on('btn-how', () => {
    const how = document.getElementById('howto');
    if (how) how.classList.toggle('hidden');
  });
  on('btn-resume', () => game.togglePause());
  on('btn-restart', () => game.startGame());
  on('btn-next', () => game.nextLevel());
  on('btn-retry', () => game.retryLevel());
  on('btn-again', () => game.startGame());
  on('btn-menu', () => { state.screen = 'start'; showOverlay(); updateHud(state); });
  on('btn-hint', () => game.useHint());
  on('btn-pause', () => game.togglePause());
  on('btn-sound', () => {
    audio.setMuted(!audio.isMuted());
    const el = document.getElementById('btn-sound');
    if (el) el.textContent = audio.isMuted() ? '🔇 Muted' : '🔊 Sound on';
  });
}

canvasL.addEventListener('click', (e) => game.handleClick(canvasL, e.clientX, e.clientY));
canvasR.addEventListener('click', (e) => game.handleClick(canvasR, e.clientX, e.clientY));

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (state.screen === 'start' || state.screen === 'win')) game.startGame();
  else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') game.togglePause();
  else if (e.key === 'h' || e.key === 'H') game.useHint();
  else if (e.key === 'm' || e.key === 'M') {
    audio.setMuted(!audio.isMuted());
    const el = document.getElementById('btn-sound');
    if (el) el.textContent = audio.isMuted() ? '🔇 Muted' : '🔊 Sound on';
  }
});

bindButtons();
updateHud(state);
showOverlay();

// Loop utama: update timer + render adegan + overlay.
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  game.update(dt);
  game.render();
  showOverlay();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Mode screenshot: ?shot=start|play|end — autopilot lalu tandai siap.
const params = new URLSearchParams(location.search);
if (params.has('shot')) {
  // Beri satu frame supaya canvas terpasang sebelum autopilot berjalan.
  requestAnimationFrame(() => {
    applyShotMode(game, params);
    showOverlay();
  });
}
window.__game = game;
