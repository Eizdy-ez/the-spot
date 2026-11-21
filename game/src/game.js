// game.js — state permainan THE SPOT: layar, level, klik, skor,
// timer, hati, hint, dan transisi menang/kalah per level.
import { LEVELS, DIFFS_PER_LEVEL, LEVEL_TIME, MAX_HEARTS, MAX_HINTS, POINTS_PER_FIND, TIME_BONUS_PER_SECOND, SCENE_W, SCENE_H } from './config.js';
import { drawScene } from './draw.js';
import { drawMarkers, updateHud } from './render.js';
import { audio } from './audio.js';

export function bestScore() {
  try { return Number(localStorage.getItem('spot-difference-best') || 0); } catch { return 0; }
}
export function saveBestScore(score) {
  try {
    if (score > bestScore()) localStorage.setItem('spot-difference-best', String(score));
  } catch { /* penyimpanan tidak tersedia: abaikan */ }
}

export function createGame(canvasL, canvasR) {
  const ctxL = canvasL.getContext('2d');
  const ctxR = canvasR.getContext('2d');

  const state = {
    screen: 'start', // start | playing | paused | levelClear | win | levelFail
    levelIndex: 0,
    levels: LEVELS,
    found: new Map(),
    misses: [],
    hint: null,
    hintUntil: 0,
    hearts: MAX_HEARTS,
    hintsLeft: MAX_HINTS,
    score: 0,
    timeLeft: LEVEL_TIME,
    lastTickSecond: LEVEL_TIME,
    best: bestScore(),
    frozenTime: null, // di mode screenshot, animasi dibekukan
  };

  function level() { return LEVELS[state.levelIndex]; }

  function changedSet() {
    // Panel kanan menerapkan SEMUA perbedaan level ini; panel kiri asli.
    // Perbedaan yang sudah ketemu ditandai di kedua panel oleh render.
    return new Set(level().diffs.map((d) => d.id));
  }

  function startLevel(index) {
    state.levelIndex = index;
    state.found = new Map();
    state.misses = [];
    state.hint = null;
    state.hearts = MAX_HEARTS;
    state.hintsLeft = MAX_HINTS;
    state.timeLeft = LEVEL_TIME;
    state.lastTickSecond = LEVEL_TIME;
    state.screen = 'playing';
    updateHud(state);
  }

  function startGame() {
    state.score = 0;
    state.best = bestScore();
    startLevel(0);
    audio.unlock();
    audio.click();
  }

  function remainingDiffs() {
    return level().diffs.filter((d) => !state.found.has(d.id));
  }

  function useHint() {
    if (state.screen !== 'playing' || state.hintsLeft <= 0) return false;
    const rest = remainingDiffs();
    if (rest.length === 0) return false;
    state.hintsLeft -= 1;
    state.hint = rest[Math.floor(Math.random() * rest.length)];
    state.hintUntil = performance.now() + 2500;
    audio.hint();
    updateHud(state);
    return true;
  }

  function timeNow() {
    return state.frozenTime !== null ? state.frozenTime : performance.now() / 1000;
  }

  // Klik di salah satu panel: koordinat dikonversi ke ruang adegan 600x400.
  function handleClick(canvas, clientX, clientY) {
    if (state.screen !== 'playing') return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * SCENE_W;
    const y = ((clientY - rect.top) / rect.height) * SCENE_H;
    const hit = remainingDiffs().find((d) => Math.hypot(d.x - x, d.y - y) <= d.r + 8);
    if (hit) {
      state.found.set(hit.id, hit);
      state.score += POINTS_PER_FIND;
      state.hint = null;
      audio.ding();
      if (state.found.size >= DIFFS_PER_LEVEL) {
        const bonus = Math.round(state.timeLeft) * TIME_BONUS_PER_SECOND;
        state.score += bonus;
        state.screen = 'levelClear';
        audio.levelClear();
        if (state.levelIndex >= LEVELS.length - 1) {
          state.screen = 'win';
          saveBestScore(state.score);
          state.best = bestScore();
          audio.win();
        }
      }
    } else {
      state.misses.push({ x, y, born: performance.now() });
      state.hearts -= 1;
      audio.buzz();
      if (state.hearts <= 0) {
        state.screen = 'levelFail';
        audio.gameOver();
      }
    }
    updateHud(state);
  }

  function nextLevel() {
    if (state.levelIndex + 1 < LEVELS.length) startLevel(state.levelIndex + 1);
    else { state.screen = 'win'; saveBestScore(state.score); state.best = bestScore(); }
    audio.click();
  }

  function retryLevel() {
    startLevel(state.levelIndex);
    audio.click();
  }

  function togglePause() {
    if (state.screen === 'playing') { state.screen = 'paused'; audio.click(); }
    else if (state.screen === 'paused') { state.screen = 'playing'; audio.click(); }
    updateHud(state);
  }

  function update(dt) {
    if (state.screen !== 'playing') return;
    state.timeLeft -= dt;
    const whole = Math.ceil(state.timeLeft);
    if (whole !== state.lastTickSecond) {
      state.lastTickSecond = whole;
      if (whole <= 10 && whole > 0) audio.tick();
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.screen = 'levelFail';
      audio.gameOver();
    }
    if (state.hint && performance.now() > state.hintUntil) state.hint = null;
    state.misses = state.misses.filter((m) => performance.now() - m.born < 700);
    updateHud(state);
  }

  function render() {
    const t = timeNow();
    const changed = changedSet();
    drawScene(ctxL, level().scene, new Set(), t);
    drawScene(ctxR, level().scene, changed, t);
    const now = performance.now();
    drawMarkers(ctxL, state.found, state.misses, state.hint, now);
    drawMarkers(ctxR, state.found, state.misses, state.hint, now);
  }

  return {
    state,
    level,
    startGame,
    startLevel,
    nextLevel,
    retryLevel,
    togglePause,
    useHint,
    handleClick,
    update,
    render,
    timeNow,
  };
}
