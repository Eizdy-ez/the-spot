// main.ts — program penyerahan THE SPOT.
// Menyalin game/ dan screenshots/ ke $MAKEFUN_OUTPUT_DIR (atau /output
// di dalam grader) lalu menulis dossier.json dengan buildDossier
// dari vendor/makefun-game.ts (kit, tidak diubah).
// Jalankan: MAKEFUN_OUTPUT_DIR=out node main.ts  (butuh Node >= 22.18)
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// Batas gate (reference/gate.json): hanya text_max_bytes yang membentuk
// byte dossier; sisanya menolak entry yang memang ditolak scorer
// (lebih dari 4 screenshot atau satu di atas 256 KiB; game/ di atas
// 993 file atau 48 MiB, atau path di bawah game/ di atas 1000 byte).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
console.log(`THE SPOT diserahkan ke ${out}`);
