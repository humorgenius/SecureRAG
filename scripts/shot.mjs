#!/usr/bin/env node
/**
 * Screenshot helper for visual checks (design review, regression).
 *
 *   node scripts/shot.mjs <url-or-dist-path> <name> [sizes]
 *
 * Sizes: comma-separated WxH list, default "1440x3000,390x1500".
 * Mobile widths (<500px) are rendered inside an iframe harness because Windows
 * Chrome enforces a ~500px minimum window width; the iframe gives a true
 * layout viewport at the requested width.
 *
 * Output: E:/hermes-workspace/outputs/securerag/<name>-<w>.png
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = 'E:\\hermes-workspace\\outputs\\securerag';
const TMP = 'E:\\hermes-workspace\\temp\\shot';
const PROFILE = 'E:\\hermes-workspace\\temp\\chrome-shot';

const [input, name, sizesArg] = process.argv.slice(2);
if (!input || !name) {
  console.error('usage: node scripts/shot.mjs <url-or-dist-path> <name> [WxH,...]');
  process.exit(1);
}

const sizes = (sizesArg ?? '1440x3000,390x1500')
  .split(',')
  .map((s) => s.trim().split('x').map(Number))
  .map(([w, h]) => ({ w, h }));

const base = input.startsWith('http') ? input : 'http://127.0.0.1:4399/' + input.replace(/^dist\//, '').replace(/^\/+/, '');
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

function shoot(url, file, size) {
  execFileSync(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-proxy-server',
      '--allow-file-access-from-files',
      '--force-prefers-reduced-motion',
      '--virtual-time-budget=4000',
      '--user-data-dir=' + PROFILE,
      '--force-device-scale-factor=1',
      `--window-size=${size.w},${size.h}`,
      '--screenshot=' + file,
      url,
    ],
    { stdio: 'ignore', timeout: 120_000 }
  );
}

for (const size of sizes) {
  const file = join(OUT, `${name}-${size.w}.png`);
  if (size.w < 500) {
    const harness = join(TMP, `wrap-${size.w}.html`);
    writeFileSync(
      harness,
      `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#fff}iframe{display:block;width:${size.w}px;height:${size.h}px;border:0}</style></head><body><iframe src="${base}" scrolling="no"></iframe></body></html>`
    );
    shoot('file:///' + resolve(harness).replace(/\\/g, '/'), file, { w: size.w + 30, h: size.h + 20 });
  } else {
    shoot(base, file, size);
  }
  console.log(file);
}
