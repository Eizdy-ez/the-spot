// render.js — menggambar penanda di atas kedua panel dan memperbarui HUD.
// Penanda hijau = perbedaan yang sudah ketemu (lingkaran + centang),
// X merah = klik salah (memudar), denyut kuning = hint aktif.
import { SCENE_W, SCENE_H } from './config.js';

function drawRing(ctx, x, y, r, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawCheck(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x - s, y);
  ctx.lineTo(x - s * 0.2, y + s * 0.8);
  ctx.lineTo(x + s, y - s * 0.8);
  ctx.stroke();
}

function drawX(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - s, y - s);
  ctx.lineTo(x + s, y + s);
  ctx.moveTo(x + s, y - s);
  ctx.lineTo(x - s, y + s);
  ctx.stroke();
}

// Gambar semua penanda untuk satu panel. `found` = Map id -> diff,
// `misses` = [{x, y, born}] klik salah, `hint` = diff yang sedang
// diberi hint (atau null), `now` = timestamp ms untuk animasi.
export function drawMarkers(ctx, found, misses, hint, now) {
  ctx.save();
  for (const diff of found.values()) {
    const pulse = 1 + Math.sin(now / 300) * 0.04;
    drawRing(ctx, diff.x, diff.y, diff.r * pulse, '#2f9e44', 5);
    drawRing(ctx, diff.x, diff.y, diff.r * pulse - 6, 'rgba(47,158,68,0.35)', 2);
    drawCheck(ctx, diff.x, diff.y, 11, '#2f9e44');
  }
  for (const m of misses) {
    const age = (now - m.born) / 700;
    if (age >= 1) continue;
    ctx.globalAlpha = 1 - age;
    drawX(ctx, m.x, m.y, 14, '#e03131');
    ctx.globalAlpha = 1;
  }
  if (hint) {
    const r = hint.r + Math.sin(now / 180) * 7;
    drawRing(ctx, hint.x, hint.y, r, '#f5b301', 4);
    drawRing(ctx, hint.x, hint.y, Math.max(6, r - 14), 'rgba(245,179,1,0.5)', 2);
  }
  ctx.restore();
}

// Perbarui teks HUD dari state permainan.
export function updateHud(state) {
  const set = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  const level = state.levels[state.levelIndex];
  const remaining = level.diffs.length - state.found.size;
  set('hud-level', level.title);
  set('hud-found', `${state.found.size} / ${level.diffs.length} found`);
  set('hud-remaining', `Remaining ${remaining}`);
  const mins = Math.floor(state.timeLeft / 60);
  const secs = Math.floor(state.timeLeft % 60);
  const timerEl = document.getElementById('hud-timer');
  if (timerEl) {
    timerEl.textContent = `${mins}:${String(secs).padStart(2, '0')}`;
    timerEl.classList.toggle('low', state.timeLeft <= 15 && state.screen === 'playing');
  }
  set('hud-score', `Score ${state.score}`);
  set('hud-hearts', '♥'.repeat(state.hearts) + '♡'.repeat(Math.max(0, 3 - state.hearts)));
  set('hud-hints', `Hint (${state.hintsLeft})`);
  const hintBtn = document.getElementById('btn-hint');
  if (hintBtn) hintBtn.disabled = state.hintsLeft <= 0 || state.screen !== 'playing';
  // Strip progres level: selesai / sedang dimainkan / terkunci.
  for (let i = 0; i < 3; i++) {
    const chip = document.getElementById(`level-chip-${i}`);
    if (!chip) continue;
    const done = i < state.levelIndex || state.screen === 'win';
    const current = i === state.levelIndex && state.screen !== 'win';
    chip.classList.toggle('done', done);
    chip.classList.toggle('current', current);
    const names = ['1 · Morning Park', '2 · Sunset Beach', '3 · Afternoon Café'];
    chip.textContent = done ? `✓ ${names[i]}` : names[i];
  }
}
