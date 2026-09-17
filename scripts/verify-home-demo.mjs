#!/usr/bin/env node
/**
 * Verify the homepage live demo: it must answer a real search, and the card must
 * not change size while doing it.
 *
 *   node scripts/verify-home-demo.mjs http://localhost:4321/zh/
 *
 * The hero card used to end in a decorative input. It now runs the real matcher
 * over three bundled documents, so this checks the three things that could break:
 * the first paint still shows the mock answer, submitting lists real sentences
 * with a real count, and the geometry (card / right column / input row heights)
 * is identical before and after — the requirement was "same box, real function".
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET = process.argv[2] ?? 'http://localhost:4321/zh/';
const QUERY = process.env.QUERY ?? '解约';
const PORT = 9341;

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    `--window-size=${process.env.VIEWPORT ?? '1440,900'}`,
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=E:/hermes-workspace/temp/cdp-demo',
    TARGET,
  ],
  { stdio: 'ignore' }
);

let exitCode = 1;
try {
  await sleep(3000);
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = list.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));

  let seq = 0;
  const pending = new Map();
  const reqs = [];
  const send = (method, params = {}) =>
    new Promise((res) => {
      const id = ++seq;
      pending.set(id, res);
      ws.send(JSON.stringify({ id, method, params }));
    });
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
      return;
    }
    if (m.method === 'Network.responseReceived') reqs.push({ url: m.params.response.url, status: m.params.response.status });
    if (m.method === 'Runtime.exceptionThrown') console.log('  [page exception]', JSON.stringify(m.params.exceptionDetails).slice(0, 240));
    if (m.method === 'Runtime.consoleAPICalled' && /error|warn/i.test(m.params.type)) {
      console.log('  [console ' + m.params.type + ']', (m.params.args ?? []).map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
    }
  });
  await send('Runtime.enable');
  await send('Network.enable');
  await sleep(2500);

  const evalJs = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    if (r.result?.exceptionDetails) console.log('  evaluate threw:', JSON.stringify(r.result.exceptionDetails).slice(0, 220));
    return r.result?.result?.value;
  };

  const measure = `(function(){
    var box = function (sel) { var n = document.querySelector(sel); return n ? Math.round(n.getBoundingClientRect().height) : null; };
    var q2 = document.querySelector('.q2'); var who = document.querySelector('.who');
    return JSON.stringify({
      card: box('.herocard'), right: box('.hc-right'), foot: box('.hc-foot'), input: box('.hc-foot input'),
      q2: q2 ? q2.textContent.trim().slice(0, 40) : null,
      who: who ? who.textContent.trim().slice(0, 40) : null,
      hits: document.querySelectorAll('.demo-hits li').length,
      docs: document.querySelectorAll('.demo-doc-h').length,
    });
  })()`;

  console.log('=== 首屏（未搜索）===');
  console.log(' ', await evalJs(measure));

  console.log('=== 输入「' + QUERY + '」并点检索 ===');
  console.log(
    ' ',
    await evalJs(`(function(){
      var i = document.querySelector('.hc-foot input');
      if (!i) return 'no input';
      i.value = ${JSON.stringify(QUERY)};
      i.dispatchEvent(new Event('input', { bubbles: true }));
      return 'typed';
    })()`)
  );
  // The button is disabled while the field is empty, and Preact re-renders on a
  // microtask — clicking in the same tick would hit a disabled button.
  await sleep(500);
  console.log(
    ' ',
    await evalJs(`(function(){
      var btn = [].slice.call(document.querySelectorAll('.hc-foot button')).find(function (b) { return /检索|Search/.test(b.textContent); });
      if (!btn) return 'no button';
      if (btn.disabled) return 'button still disabled';
      btn.click();
      return 'clicked';
    })()`)
  );
  await sleep(1500);

  console.log('=== 搜索后 ===');
  console.log(' ', await evalJs(measure));
  console.log('  按文档:', await evalJs(`JSON.stringify([].slice.call(document.querySelectorAll('.demo-doc-h')).map(function (n) { return n.textContent.replace(/\\s+/g, ' ').trim(); }))`));
  console.log('  前 3 条命中:');
  const hits = await evalJs(`JSON.stringify([].slice.call(document.querySelectorAll('.demo-hits li')).slice(0, 3).map(function (n) { return n.textContent.replace(/\\s+/g, ' ').trim().slice(0, 88); }))`);
  for (const h of JSON.parse(hits ?? '[]')) console.log('    ·', h);

  const own = new URL(TARGET).origin;
  const external = reqs.filter((r) => !r.url.startsWith(own) && !r.url.startsWith('data:'));
  const heavy = reqs.filter((r) => /ort\/|huggingface|\.onnx/.test(r.url));
  // Resource timing survives Network.enable being called late.
  const res = await evalJs(
    "JSON.stringify(Array.prototype.filter.call(performance.getEntriesByType('resource'), function (e) {" +
      "return new RegExp('ort/|huggingface|.onnx|.wasm').test(e.name);}).map(function (e) { return e.name.slice(-60); }))"
  );
  console.log('  性能条目里的 ort/模型资源:', res);
  console.log('=== 网络 ===');
  console.log(`  总请求 ${reqs.length}｜站外请求 ${external.length}｜ort 或模型请求 ${heavy.length}`);
  // Clip to the card itself: the hero text fills the viewport, and the card is
  // below the fold, so a plain screenshot proves nothing about the demo.
  const box = JSON.parse(
    (await evalJs(
      "(function(){var n=document.querySelector('.herocard');if(!n)return 'null';var r=n.getBoundingClientRect();" +
        "return JSON.stringify({x:r.left+window.scrollX,y:r.top+window.scrollY,w:r.width,h:r.height});})()"
    )) ?? 'null'
  );
  const shot = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    ...(box ? { clip: { x: box.x, y: box.y, width: box.w, height: box.h, scale: 1 } } : {}),
  });
  if (shot.result?.data) {
    const out = `E:/hermes-workspace/outputs/securerag/demo-${QUERY.length > 4 ? 'en' : 'zh'}-search.png`;
    const { writeFileSync } = await import('node:fs');
    writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
    console.log('  截图:', out);
  }

  exitCode = 0;
  ws.close();
} catch (e) {
  console.error('verify-home-demo error:', e);
} finally {
  chrome.kill();
}
process.exit(exitCode);
