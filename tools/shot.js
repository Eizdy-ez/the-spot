// shot.js — ambil screenshot JPEG 1280x800 via CDP (Chrome headless).
// Pakai: node shot.js <url> <out.jpg> [timeoutMs]
// Menunggu window.__shotReady === true sebelum memotret.
import { spawn, execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const [url, out, timeoutMsRaw] = process.argv.slice(2);
const timeoutMs = Number(timeoutMsRaw || 20000);
if (!url || !out) {
  console.error('usage: node shot.js <url> <out.jpg> [timeoutMs]');
  process.exit(2);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(path) {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:9222${path}`);
      if (res.ok) return await res.json();
    } catch { /* belum siap */ }
    await sleep(250);
  }
  throw new Error('CDP tidak merespons di port 9222');
}

let idCounter = 1;
const pending = new Map();
let ws;
let sessionId = null;

function send(method, params = {}, session = undefined) {
  return new Promise((resolve, reject) => {
    const id = idCounter++;
    pending.set(id, { resolve, reject });
    const msg = { id, method, params };
    if (session) msg.sessionId = session;
    ws.send(JSON.stringify(msg));
    setTimeout(() => {
      if (pending.has(id)) { pending.delete(id); reject(new Error(`timeout ${method}`)); }
    }, 30000);
  });
}

async function main() {
  // Pastikan policy WebGL Hatch ada (localhost gagal tanpa ini).
  execSync(`printf 'hatch-webgl-allowed-domains-v1\\nexample.com\\n' > /tmp/pol-ok.txt`, { stdio: 'ignore' });
  const sha = execSync('sha256sum /tmp/pol-ok.txt', { encoding: 'utf8' }).split(' ')[0];

  const chrome = spawn('/opt/meta-chromium/chrome', [
    '--headless=new', '--no-sandbox', '--disable-gpu',
    '--remote-debugging-port=9222', '--remote-allow-origins=*',
    '--allow-file-access-from-files', '--window-size=1280,800',
    '--user-data-dir=/tmp/chrome-shot-profile',
    `--hatch-webgl-allowed-domains-file=/tmp/pol-ok.txt`,
    `--hatch-webgl-allowed-domains-sha256=${sha}`,
    'about:blank',
  ], { stdio: 'ignore', detached: true });
  chrome.unref();

  try {
    const version = await getJson('/json/version');
    ws = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.error('JS EXCEPTION:', JSON.stringify(msg.params.exceptionDetails).slice(0, 2000));
      }
    };

    const target = await send('Target.createTarget', { url: 'about:blank' });
    const attached = await send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
    sessionId = attached.sessionId;
    await send('Page.enable', {}, sessionId);
    await send('Runtime.enable', {}, sessionId);
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false }, sessionId);
    await send('Page.navigate', { url }, sessionId);

    const deadline = Date.now() + timeoutMs;
    let ready = false;
    while (Date.now() < deadline) {
      await sleep(500);
      try {
        const r = await send('Runtime.evaluate', { expression: 'window.__shotReady === true', returnByValue: true }, sessionId);
        if (r && r.result && r.result.value === true) { ready = true; break; }
      } catch { /* coba lagi */ }
    }
    if (!ready) {
      const state = await send('Runtime.evaluate', { expression: 'JSON.stringify({ready: window.__shotReady, title: document.title, hasGame: !!window.__game})', returnByValue: true }, sessionId).catch(() => null);
      throw new Error(`__shotReady tidak muncul dalam ${timeoutMs}ms. State: ${state?.result?.value}`);
    }
    await sleep(300);
    const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 82 }, sessionId);
    writeFileSync(out, Buffer.from(shot.data, 'base64'));
    console.log(`screenshot tersimpan: ${out}`);
  } finally {
    try { ws?.close(); } catch { /* abaikan */ }
    try { execSync('fuser -k 9222/tcp', { stdio: 'ignore' }); } catch { /* sudah mati */ }
  }
}

main().catch((e) => { console.error('GAGAL:', e.message); process.exit(1); });
