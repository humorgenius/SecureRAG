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
    `--window-size=${process.env.VIEWPORT || '1440,900'}`,
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=E:/hermes-workspace/temp/cdp-diag2',
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
    "var row=document.querySelector(\'.sr-doc\');" +
    "if(row){var nm=row.querySelector(\'.sr-doc-main b\');var act=row.querySelector(\'.sr-doc-actions\');" +
    "o.docRow={name:nm?nm.textContent.slice(0,30):null," +
    "nameW:nm?Math.round(nm.getBoundingClientRect().width):0," +
    "actionsInsideMain:!!(act&&act.closest(\'.sr-doc-main\'))," +
    "actionsBelowName:!!(act&&nm&&act.getBoundingClientRect().top>=nm.getBoundingClientRect().bottom-1)," +
    "actions:act?Array.prototype.map.call(act.querySelectorAll(\'button\'),function(b){return b.textContent.trim();}):[]};}" +
    "var ex=document.querySelector(\'.sr-export\');" +
    "o.exportGroup=ex?Array.prototype.map.call(ex.querySelectorAll(\'button\'),function(b){return b.textContent.trim();}):null;" +
    "o.vp={inner:window.innerWidth,outer:window.outerWidth," +
    "scrollW:document.documentElement.scrollWidth,bodyW:document.body.scrollWidth," +
    "overflowX:document.documentElement.scrollWidth>window.innerWidth};" +
    "var wide=[];document.querySelectorAll(\'body *\').forEach(function(el){var r=el.getBoundingClientRect();" +
    "if(r.right>window.innerWidth+1)wide.push(el.tagName+\'.\'+(el.className||\'\').toString().split(\' \')[0]+\'@\'+Math.round(r.right));});" +
    "o.overflowing=wide.slice(0,8);" +
    "var h1=document.querySelector(\'h1\');" +
    "o.h1=h1?{text:h1.innerText.replace(/\\n/g,\' | \').slice(0,100)," +
    "lines:Math.round(h1.getBoundingClientRect().height/parseFloat(getComputedStyle(h1).lineHeight))," +
    "w:Math.round(h1.getBoundingClientRect().width),fs:getComputedStyle(h1).fontSize}:null;" +
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
  if (data.vp) console.log(`VIEWPORT：inner=${data.vp.inner} outer=${data.vp.outer} scrollW=${data.vp.scrollW} bodyW=${data.vp.bodyW} overflowX=${data.vp.overflowX}`, data.overflowing && data.overflowing.length ? `\n  溢出元素: ${data.overflowing.join(', ')}` : '');
  if (data.h1) console.log(`H1：lines=${data.h1.lines} width=${data.h1.w}px font=${data.h1.fs}\n     "${data.h1.text}"`);
  console.log('EXPORT GROUP：', data.exportGroup ? data.exportGroup.join(' ') : '(not on this page)');
  if (data.docRow) {
    const r = data.docRow;
    console.log('DOC ROW：');
    console.log(`  name="${r.name}"  rendered width=${r.nameW}px`);
    console.log(`  actions inside .sr-doc-main: ${r.actionsInsideMain}`);
    console.log(`  actions below the name:      ${r.actionsBelowName}`);
    console.log(`  action labels: ${r.actions.join(' / ')}`);
  } else {
    console.log('DOC ROW：(no documents in this profile)');
  }

  exitCode = 0;
  ws.close();
} catch (e) {
  console.error('probe error:', e);
} finally {
  chrome.kill();
}
process.exit(exitCode);
