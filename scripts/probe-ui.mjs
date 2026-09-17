#!/usr/bin/env node
/**
 * Measure what the browser actually renders for the text surfaces.
 *
 *   node scripts/probe-ui.mjs http://localhost:4321/zh/tools/token-counter/
 *
 * Reasoning about CSS is not evidence: this prints the rendered height, class
 * list and placeholder of every textarea/input, plus the buttons and the answer
 * note, on whatever page you point it at.
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET = process.argv[2] ?? 'http://localhost:4321/zh/tools/token-counter/';
const PORT = 9338;

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-proxy-server',
    '--no-first-run',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=E:/hermes-workspace/temp/cdp-probe',
    'about:blank',
  ],
  { stdio: 'ignore' }
);

let exitCode = 1;
try {
  await sleep(2500);
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = list.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));

  let seq = 0;
  const pending = new Map();
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
  });
  const send = (method, params = {}) =>
    new Promise((res) => {
      const i = ++seq;
      pending.set(i, res);
      ws.send(JSON.stringify({ id: i, method, params }));
    });

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.navigate', { url: TARGET });
  await sleep(6000);

  const expr =
    "(function(){var o={url:location.pathname,textareas:[],buttons:[],notes:[]};" +
    "document.querySelectorAll('textarea').forEach(function(t){var r=t.getBoundingClientRect();" +
    "o.textareas.push({h:Math.round(r.height),w:Math.round(r.width),cls:t.className,ph:(t.placeholder||'').slice(0,24)});});" +
    "document.querySelectorAll('button,.btn,label.btn').forEach(function(b){var r=b.getBoundingClientRect();" +
    "if(r.height>0)o.buttons.push({t:(b.textContent||'').trim().slice(0,18),cls:b.className.slice(0,32),h:Math.round(r.height)});});" +
    "document.querySelectorAll('.sr-mode-note').forEach(function(n){o.notes.push((n.textContent||'').slice(0,60));});" +
    "return JSON.stringify(o);})()";

  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
  if (r.result?.exceptionDetails) console.log('threw:', JSON.stringify(r.result.exceptionDetails).slice(0, 200));
  const data = JSON.parse(r.result?.result?.value ?? '{}');

  console.log(`\n=== ${data.url} ===`);
  console.log('TEXTAREAS：');
  for (const t of data.textareas ?? []) console.log(`  h=${String(t.h).padStart(4)}px  w=${t.w}px  class="${t.cls}"  ph="${t.ph}"`);
  if (!(data.textareas ?? []).length) console.log('  (none)');
  console.log('BUTTONS / LABELS：');
  for (const b of data.buttons ?? []) console.log(`  h=${String(b.h).padStart(3)}px  class="${b.cls}"  "${b.t}"`);
  console.log('ANSWER NOTE：', (data.notes ?? []).length ? data.notes.join(' | ') : '(none)');

  exitCode = 0;
  ws.close();
} catch (e) {
  console.error('probe error:', e);
} finally {
  chrome.kill();
}
process.exit(exitCode);
