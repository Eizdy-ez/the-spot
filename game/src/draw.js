// draw.js — pelukis adegan prosedural THE SPOT.
// Setiap adegan digambar dua kali: panel kiri (asli) dan panel kanan
// (dengan perbedaan dari `changed` diterapkan). Semua seni orisinal,
// dibuat dari primitif canvas, tanpa gambar atau font eksternal.
import { SCENE_W, SCENE_H } from './config.js';

// ---- helper bentuk ----
function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}
function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}
function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}
function line(ctx, x1, y1, x2, y2, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
function cloud(ctx, x, y, s, color) {
  circle(ctx, x, y, 20 * s, color);
  circle(ctx, x + 22 * s, y - 6 * s, 24 * s, color);
  circle(ctx, x + 46 * s, y, 20 * s, color);
  ellipse(ctx, x + 22 * s, y + 8 * s, 42 * s, 14 * s, color);
}
function bird(ctx, x, y, s, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(x - 7 * s, y, 7 * s, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + 7 * s, y, 7 * s, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
}
function flower(ctx, x, y, petal, center) {
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    circle(ctx, x + Math.cos(a) * 8, y + Math.sin(a) * 8, 6, petal);
  }
  circle(ctx, x, y, 5, center);
  line(ctx, x, y + 6, x, y + 22, '#2e7d32', 3);
  ellipse(ctx, x - 6, y + 16, 6, 3, '#43a047');
}

// ---- LEVEL 1: Morning Park ----
function drawPark(ctx, changed, t) {
  const sky = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  sky.addColorStop(0, '#8ec9ee');
  sky.addColorStop(0.6, '#cfeefb');
  sky.addColorStop(1, '#e8f7d9');
  rect(ctx, 0, 0, SCENE_W, SCENE_H, sky);
  // matahari
  const drift = Math.sin(t * 0.4) * 3;
  circle(ctx, 88 + drift, 66, 38, '#ffd93b');
  circle(ctx, 88 + drift, 66, 30, '#ffe98a');
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    line(ctx, 88 + drift + Math.cos(a) * 44, 66 + Math.sin(a) * 44,
      88 + drift + Math.cos(a) * 54, 66 + Math.sin(a) * 54, '#f5b301', 4);
  }
  if (changed.has('kacamata')) {
    // kacamata hitam di matahari
    rect(ctx, 62 + drift, 56, 52, 16, '#222831');
    circle(ctx, 72 + drift, 64, 10, '#222831');
    circle(ctx, 104 + drift, 64, 10, '#222831');
    line(ctx, 82 + drift, 62, 94 + drift, 62, '#222831', 3);
  }
  // awan
  cloud(ctx, 218, 58, 1, '#ffffff');
  if (!changed.has('awan')) cloud(ctx, 400, 52, 0.85, '#ffffff');
  // burung
  bird(ctx, 300, 78, 1, '#37474f');
  bird(ctx, 348, 58, 0.9, '#37474f');
  if (!changed.has('burung')) bird(ctx, 398, 88, 0.9, '#37474f');
  // tanah dan jalan
  rect(ctx, 0, 250, SCENE_W, 150, '#7ec850');
  rect(ctx, 0, 250, SCENE_W, 10, '#6db544');
  poly(ctx, [[250, 260], [350, 260], [380, 400], [220, 400]], '#e8d5a3');
  // pohon
  rect(ctx, 96, 180, 22, 80, '#8d5a2b');
  circle(ctx, 107, 150, 46, '#2f9e44');
  circle(ctx, 72, 172, 32, '#37b24d');
  circle(ctx, 142, 172, 32, '#40c057');
  circle(ctx, 107, 128, 28, '#51cf66');
  // bangku
  rect(ctx, 318, 236, 84, 10, '#a4713a');
  rect(ctx, 318, 252, 84, 10, '#a4713a');
  rect(ctx, 326, 236, 8, 44, '#7a4f21');
  rect(ctx, 386, 236, 8, 44, '#7a4f21');
  rect(ctx, 322, 262, 8, 18, '#5d3a17');
  rect(ctx, 390, 262, 8, 18, '#5d3a17');
  if (!changed.has('bantal')) {
    rect(ctx, 330, 226, 60, 12, '#e03131');
    ellipse(ctx, 360, 226, 30, 6, '#f0655a');
  }
  // air mancur kecil
  ellipse(ctx, 520, 330, 52, 16, '#b7d7ea');
  ellipse(ctx, 520, 328, 40, 11, '#7ec8e3');
  line(ctx, 520, 296, 520, 326, '#7ec8e3', 5);
  circle(ctx, 520, 292, 7, '#a5d8ff');
  circle(ctx, 508, 300, 4, '#a5d8ff');
  circle(ctx, 532, 300, 4, '#a5d8ff');
  // bunga-bunga
  flower(ctx, 60, 352, '#ff6b9d', '#ffd93b');
  flower(ctx, 120, 362, '#ffd93b', '#e8590c');
  if (!changed.has('bunga')) flower(ctx, 182, 352, '#e03131', '#ffd93b');
  else { line(ctx, 182, 358, 182, 374, '#2e7d32', 3); ellipse(ctx, 176, 368, 6, 3, '#43a047'); }
  flower(ctx, 244, 362, '#9775fa', '#ffd93b');
  flower(ctx, 300, 352, '#ff922b', '#7b2fbe');
  // kupu-kupu
  if (!changed.has('kupu')) {
    const flap = Math.sin(t * 6) * 4;
    ellipse(ctx, 238, 312, 8, 5 - flap * 0.2, '#9775fa');
    ellipse(ctx, 252, 312, 8, 5 - flap * 0.2, '#ff6b9d');
    line(ctx, 245, 306, 245, 322, '#333', 2);
  }
  // kucing duduk di rumput
  ellipse(ctx, 468, 330, 30, 20, '#f08c3c');
  circle(ctx, 452, 302, 16, '#f08c3c');
  poly(ctx, [[440, 290], [446, 274], [452, 288]], '#f08c3c');
  poly(ctx, [[458, 288], [464, 274], [468, 290]], '#f08c3c');
  circle(ctx, 446, 300, 2, '#222');
  circle(ctx, 458, 300, 2, '#222');
  line(ctx, 448, 310, 456, 310, '#a34d00', 2);
  if (!changed.has('ekor')) {
    ctx.strokeStyle = '#f08c3c'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(494, 330); ctx.quadraticCurveTo(512, 322, 508, 298); ctx.stroke();
  } else {
    ctx.strokeStyle = '#f08c3c'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(494, 336); ctx.quadraticCurveTo(514, 340, 522, 356); ctx.stroke();
  }
}

// ---- LEVEL 2: Sunset Beach ----
function drawBeach(ctx, changed, t) {
  const sky = ctx.createLinearGradient(0, 0, 0, SCENE_H);
  sky.addColorStop(0, '#ff9e5e');
  sky.addColorStop(0.45, '#ff7e67');
  sky.addColorStop(0.6, '#e05d7a');
  sky.addColorStop(1, '#7b4b94');
  rect(ctx, 0, 0, SCENE_W, SCENE_H, sky);
  // matahari terbenam
  circle(ctx, 450, 158, 44, '#ffb703');
  circle(ctx, 450, 158, 34, '#ffd166');
  // laut
  rect(ctx, 0, 200, SCENE_W, 80, '#2a6f97');
  rect(ctx, 0, 200, SCENE_W, 8, '#4d96c4');
  const shimmer = Math.sin(t * 1.2) * 6;
  for (let i = 0; i < 5; i++) {
    line(ctx, 60 + i * 110 + shimmer, 222 + (i % 2) * 18, 120 + i * 110 + shimmer, 222 + (i % 2) * 18, '#8ecae6', 3);
  }
  // perahu
  poly(ctx, [[352, 216], [416, 216], [404, 234], [364, 234]], '#8d5a2b');
  line(ctx, 384, 216, 384, 168, '#6b4226', 4);
  if (changed.has('layar')) poly(ctx, [[388, 172], [388, 212], [420, 212]], '#fff8e1');
  // camar
  bird(ctx, 180, 66, 1, '#3d2c2c');
  bird(ctx, 240, 48, 0.9, '#3d2c2c');
  if (!changed.has('camar')) bird(ctx, 452, 76, 0.9, '#3d2c2c');
  // pasir
  rect(ctx, 0, 280, SCENE_W, 120, '#f2d5a0');
  ellipse(ctx, 300, 282, 300, 10, '#e8c88a');
  // pohon kelapa
  ctx.strokeStyle = '#8d5a2b'; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(84, 300); ctx.quadraticCurveTo(96, 230, 84, 186); ctx.stroke();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i - 2) * 0.55;
    ctx.strokeStyle = '#2f9e44'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(84, 186);
    ctx.quadraticCurveTo(84 + Math.cos(a) * 34, 186 + Math.sin(a) * 26, 84 + Math.cos(a) * 62, 186 + Math.sin(a) * 44);
    ctx.stroke();
  }
  circle(ctx, 96, 178, 8, '#6b4226');
  circle(ctx, 78, 182, 8, '#6b4226');
  if (!changed.has('kelapa')) circle(ctx, 88, 192, 8, '#6b4226');
  // payung
  line(ctx, 300, 238, 300, 312, '#d9a066', 5);
  if (!changed.has('payung')) {
    poly(ctx, [[252, 238], [300, 196], [348, 238]], '#e03131');
    poly(ctx, [[276, 238], [300, 196], [300, 238]], '#fff3e0');
    poly(ctx, [[300, 196], [324, 238], [300, 238]], '#fff3e0');
  } else {
    poly(ctx, [[252, 238], [300, 196], [348, 238]], '#ff922b');
    poly(ctx, [[276, 238], [300, 196], [300, 238]], '#ffd166');
    poly(ctx, [[300, 196], [324, 238], [300, 238]], '#ffd166');
  }
  // ember
  if (!changed.has('ember')) {
    poly(ctx, [[168, 316], [196, 316], [190, 348], [174, 348]], '#e03131');
    rect(ctx, 164, 312, 36, 8, '#c2255c');
    line(ctx, 170, 314, 194, 314, '#862e9c', 3);
  }
  // bintang laut
  if (!changed.has('bintang')) {
    ctx.fillStyle = '#ff922b';
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i / 10) * Math.PI * 2;
      const r = i % 2 === 0 ? 18 : 8;
      const px = 432 + Math.cos(a) * r, py = 342 + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    circle(ctx, 432, 342, 3, '#e8590c');
  }
  // kepiting kecil
  ellipse(ctx, 520, 350, 22, 14, '#e8590c');
  circle(ctx, 506, 340, 5, '#e8590c');
  circle(ctx, 534, 340, 5, '#e8590c');
  line(ctx, 500, 358, 488, 366, '#e8590c', 3);
  line(ctx, 540, 358, 552, 366, '#e8590c', 3);
  // jejak kaki
  if (!changed.has('jejak')) {
    for (let i = 0; i < 4; i++) {
      ellipse(ctx, 252 + i * 12, 344 + i * 8, 7, 4, '#d9b380');
      ellipse(ctx, 268 + i * 12, 352 + i * 8, 7, 4, '#d9b380');
    }
  }
}

// ---- LEVEL 3: Afternoon Café ----
function drawCafe(ctx, changed, t) {
  rect(ctx, 0, 0, SCENE_W, SCENE_H, '#f6e3c5');
  rect(ctx, 0, 0, SCENE_W, 260, '#eecfa8');
  rect(ctx, 0, 260, SCENE_W, 140, '#b08954');
  rect(ctx, 0, 252, SCENE_W, 10, '#8d5a2b');
  // jendela
  rect(ctx, 52, 52, 196, 160, '#8d5a2b');
  rect(ctx, 60, 60, 180, 144, '#2b3a67');
  circle(ctx, 200, 96, 22, '#ffe98a');
  circle(ctx, 96, 88, 14, '#fff3e0');
  circle(ctx, 128, 76, 10, '#fff3e0');
  if (!changed.has('burungJendela')) bird(ctx, 150, 110, 1, '#fff3e0');
  line(ctx, 150, 60, 150, 204, '#8d5a2b', 6);
  line(ctx, 60, 132, 240, 132, '#8d5a2b', 6);
  // poster berbingkai
  rect(ctx, 428, 60, 96, 116, '#6b4226');
  rect(ctx, 436, 68, 80, 100, '#fdf6e3');
  if (!changed.has('poster')) {
    circle(ctx, 476, 108, 20, '#ffd93b');
    circle(ctx, 488, 96, 16, '#fdf6e3');
  } else {
    poly(ctx, [[476, 88], [481, 102], [496, 104], [485, 114], [488, 128], [476, 120], [464, 128], [467, 114], [456, 104], [471, 102]], '#f5b301');
  }
  line(ctx, 448, 152, 504, 152, '#9775fa', 3);
  // lampu gantung
  line(ctx, 300, 0, 300, 44, '#5d3a17', 4);
  poly(ctx, [[276, 44], [324, 44], [312, 74], [288, 74]], '#2f9e44');
  if (!changed.has('lampu')) {
    circle(ctx, 300, 80, 12, '#ffd93b');
    const glow = ctx.createRadialGradient(300, 82, 4, 300, 82, 60);
    glow.addColorStop(0, 'rgba(255,217,59,0.45)');
    glow.addColorStop(1, 'rgba(255,217,59,0)');
    rect(ctx, 240, 30, 120, 110, glow);
  } else {
    circle(ctx, 300, 80, 10, '#b0a89a');
  }
  // meja
  rect(ctx, 190, 280, 320, 18, '#8d5a2b');
  rect(ctx, 210, 298, 14, 62, '#6b4226');
  rect(ctx, 476, 298, 14, 62, '#6b4226');
  // cangkir kopi + uap
  ellipse(ctx, 258, 268, 30, 10, '#fff3e0');
  rect(ctx, 232, 238, 52, 30, '#e03131');
  ellipse(ctx, 258, 238, 26, 8, '#f0655a');
  circle(ctx, 288, 252, 10, '#e03131');
  const steam = Math.sin(t * 2) * 3;
  line(ctx, 248 + steam, 232, 244 + steam, 214, 'rgba(120,120,120,0.7)', 3);
  line(ctx, 262 - steam, 232, 266 - steam, 212, 'rgba(120,120,120,0.7)', 3);
  if (!changed.has('sendok')) {
    ellipse(ctx, 302, 292, 16, 4, '#adb5bd');
    circle(ctx, 316, 290, 6, '#adb5bd');
  }
  // kue di piring
  ellipse(ctx, 384, 272, 40, 10, '#fff3e0');
  poly(ctx, [[356, 268], [412, 268], [404, 240], [364, 240]], '#d9a066');
  poly(ctx, [[360, 248], [408, 248], [404, 240], [364, 240]], '#ff6b9d');
  if (!changed.has('ceri')) {
    circle(ctx, 384, 234, 8, '#e03131');
    line(ctx, 384, 226, 390, 218, '#2f9e44', 2);
  }
  // tanaman di pot
  poly(ctx, [[496, 300], [540, 300], [534, 330], [502, 330]], '#c2255c');
  line(ctx, 518, 300, 518, 252, '#2e7d32', 5);
  ellipse(ctx, 496, 258, 16, 10, '#37b24d');
  ellipse(ctx, 540, 258, 16, 10, '#2f9e44');
  ellipse(ctx, 518, 244, 16, 12, '#40c057');
  if (!changed.has('bungaTanaman')) flower(ctx, 518, 228, '#ff6b9d', '#ffd93b');
  // kursi + kucing tidur
  rect(ctx, 96, 300, 120, 12, '#7a4f21');
  rect(ctx, 104, 312, 10, 48, '#7a4f21');
  rect(ctx, 198, 312, 10, 48, '#7a4f21');
  ellipse(ctx, 156, 296, 42, 14, '#868e96');
  circle(ctx, 128, 288, 13, '#868e96');
  poly(ctx, [[118, 278], [123, 266], [128, 277]], '#868e96');
  poly(ctx, [[132, 277], [137, 266], [140, 278]], '#868e96');
  if (!changed.has('ekorKucing')) {
    ctx.strokeStyle = '#868e96'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(192, 296); ctx.quadraticCurveTo(206, 288, 198, 276); ctx.stroke();
  } else {
    ctx.strokeStyle = '#868e96'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(194, 298); ctx.lineTo(222, 300); ctx.stroke();
  }
  // garis lantai
  line(ctx, 0, 360, SCENE_W, 360, 'rgba(93,58,23,0.35)', 2);
}

export const SCENES = { park: drawPark, beach: drawBeach, cafe: drawCafe };

// Gambar satu adegan ke ctx. `changed` = Set id perbedaan yang diterapkan
// (panel kanan). `t` = waktu animasi dalam detik.
export function drawScene(ctx, sceneId, changed, t) {
  ctx.save();
  ctx.clearRect(0, 0, SCENE_W, SCENE_H);
  SCENES[sceneId](ctx, changed, t);
  ctx.restore();
}
