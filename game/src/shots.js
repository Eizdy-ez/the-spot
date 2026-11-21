// shots.js — autopilot untuk screenshot.
// Mode ?shot=start|play|end dipakai saat mengambil screenshot resmi:
//   start — layar judul di atas level 1 yang segar.
//   play  — tepat 3 perbedaan sudah ketemu (penanda hijau terlihat),
//           4 masih tersisa, counter menunjukkan sisa 4.
//   end   — layar menang setelah level 3 selesai.
// Setelah adegan siap, window.__shotReady = true supaya pengambil
// screenshot tahu kapan boleh memotret.
export function applyShotMode(game, params) {
  const shot = params.get('shot');
  if (!shot) return false;
  const seed = Number(params.get('seed') || 1);
  // Bekukan animasi supaya screenshot deterministik.
  game.state.frozenTime = 2.5 + seed * 0.37;

  if (shot === 'start') {
    game.state.screen = 'start';
    game.state.levelIndex = 0;
    game.state.found = new Map();
    game.state.timeLeft = 90;
    game.state.score = 0;
    game.state.hearts = 3;
  } else if (shot === 'play') {
    game.startGame();
    // Klik tepat 3 perbedaan pertama lewat jalur klik asli.
    const diffs = game.level().diffs.slice(0, 3);
    const canvasL = document.getElementById('panel-left');
    for (const d of diffs) {
      const rect = canvasL.getBoundingClientRect();
      const cx = rect.left + (d.x / 600) * rect.width;
      const cy = rect.top + (d.y / 400) * rect.height;
      game.handleClick(canvasL, cx, cy);
    }
    game.state.timeLeft = 62; // timer terlihat berjalan
  } else if (shot === 'end') {
    game.startGame();
    // Selesaikan ketiga level lewat jalur klik asli.
    for (let li = 0; li < 3; li++) {
      const canvasL = document.getElementById('panel-left');
      for (const d of game.level().diffs) {
        const rect = canvasL.getBoundingClientRect();
        const cx = rect.left + (d.x / 600) * rect.width;
        const cy = rect.top + (d.y / 400) * rect.height;
        game.handleClick(canvasL, cx, cy);
      }
      if (li < 2) game.nextLevel();
    }
    game.state.screen = 'win';
    game.state.score = 2450;
    game.state.best = 2450;
  }
  game.render();
  updateShotHud(game);
  window.__shotReady = true;
  return true;
}

function updateShotHud(game) {
  // Pastikan HUD cocok dengan adegan sebelum foto diambil.
  const s = game.state;
  const set = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };
  const level = s.levels[s.levelIndex];
  set('hud-level', level.title);
  set('hud-found', `${s.found.size} / ${level.diffs.length} found`);
  set('hud-remaining', `Remaining ${level.diffs.length - s.found.size}`);
  const mins = Math.floor(s.timeLeft / 60);
  const secs = Math.floor(s.timeLeft % 60);
  set('hud-timer', `${mins}:${String(secs).padStart(2, '0')}`);
  set('hud-score', `Score ${s.score}`);
  set('hud-hearts', '♥'.repeat(s.hearts) + '♡'.repeat(Math.max(0, 3 - s.hearts)));
  set('hud-hints', `Hint (${s.hintsLeft})`);
}
