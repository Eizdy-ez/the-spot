// dbg.js — debug halaman game via CDP: navigasi, cetak exception JS
// lengkap dan state window (__shotReady, __game, judul).
// Pakai: node dbg.js <url> [waitMs]
import { spawn, execSync } from 'node:child_process';

const [url, waitRaw] = process.argv.slice(2);
const waitMs = Number(waitRaw || 6000);
if (!url) { console.error('usage: node dbg.js <url> [waitMs]'); process.exit(2); }

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
function send(method, params = {}, session = undefined) {
  return new Promise((resolve, reject) => {
    const id = idCounter++;
    pending.set(id, { resolve, reject });
    const msg = { id, method, params };
    if (session) msg.sessionId = session;
    ws.send(JSON.stringify(msg));
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error(`timeout ${method}`)); } }, 30000);
  });
}

async function main() {
  execSync(`printf 'hatch-webgl-allowed-domains-v1\\nexample.com\\n' > /tmp/pol-ok.txt`, { stdio: 'ignore' });
  const sha = execSync('sha256sum /tmp/pol-ok.txt', { encoding: 'utf8' }).split(' ')[0];
  const chrome = spawn('/opt/meta-chromium/chrome', [
    '--headless=new', '--no-sandbox', '--disable-gpu',
    '--remote-debugging-port=9222', '--remote-allow-origins=*',
    '--allow-file-access-from-files', '--window-size=1280,800',
    '--user-data-dir=/tmp/chrome-shot-profile',
    '--hatch-webgl-allowed-domains-file=/tmp/pol-ok.txt',
    `--hatch-webgl-allowed-domains-sha256=${sha}`,
    'about:blank',
  ], { stdio: 'ignore', detached: true });
  chrome.unref();
  try {
    const version = await getJson('/json/version');
    ws = new WebSocket(version.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.error('EXCEPTION:', JSON.stringify(msg.params.exceptionDetails, null, 2).slice(0, 4000));
      }
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        console.error('CONSOLE.ERROR:', JSON.stringify(msg.params.args).slice(0, 2000));
      }
    };
    const target = await send('Target.createTarget', { url: 'about:blank' });
    const attached = await send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
    const sessionId = attached.sessionId;
    await send('Page.enable', {}, sessionId);
    await send('Runtime.enable', {}, sessionId);
    await send('Page.navigate', { url }, sessionId);
    await sleep(waitMs);
    const state = await send('Runtime.evaluate', {
      expression: `JSON.stringify({ready: window.__shotReady, title: document.title, hasGame: !!window.__game, screen: window.__game ? window.__game.state.screen : null, found: window.__game ? window.__game.state.found.size : null, score: window.__game ? window.__game.state.score : null})`,
      returnByValue: true,
    }, sessionId);
    console.log('STATE:', state?.result?.value);
  } finally {
    try { ws?.close(); } catch { /* abaikan */ }
    try { execSync('fuser -k 9222/tcp', { stdio: 'ignore' }); } catch { /* sudah mati */ }
  }
}
main().catch((e) => { console.error('GAGAL:', e.message); process.exit(1); });
