// audio.js — semua bunyi dibuat prosedural dengan WebAudio, tanpa file audio.
// ding saat menemukan perbedaan, buzz saat salah klik, klik tombol,
// arpeggio saat menang, dan detak saat waktu hampir habis.
let ctx = null;
let muted = false;

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, startAt, dur, type, vol) {
  const ac = ensure();
  if (!ac || muted) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, ac.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(vol, ac.currentTime + startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + startAt + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime + startAt);
  osc.stop(ac.currentTime + startAt + dur + 0.05);
}

export const audio = {
  unlock() { ensure(); },
  setMuted(m) { muted = m; },
  isMuted() { return muted; },
  click() { tone(660, 0, 0.07, 'sine', 0.12); },
  // ding dua nada yang memuaskan saat perbedaan ketemu
  ding() {
    tone(880, 0, 0.18, 'sine', 0.22);
    tone(1318.5, 0.09, 0.28, 'sine', 0.2);
  },
  // buzz rendah saat klik salah
  buzz() {
    tone(160, 0, 0.22, 'sawtooth', 0.12);
    tone(110, 0.05, 0.22, 'sawtooth', 0.1);
  },
  hint() {
    tone(523.25, 0, 0.12, 'triangle', 0.16);
    tone(783.99, 0.1, 0.16, 'triangle', 0.16);
  },
  levelClear() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.11, 0.22, 'triangle', 0.2));
  },
  win() {
    [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98].forEach((f, i) => tone(f, i * 0.13, 0.3, 'triangle', 0.2));
  },
  tick() { tone(1200, 0, 0.05, 'square', 0.06); },
  gameOver() {
    [392, 329.63, 261.63].forEach((f, i) => tone(f, i * 0.16, 0.28, 'sine', 0.16));
  },
};
