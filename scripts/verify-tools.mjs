#!/usr/bin/env node
/**
 * Proves the chunking engine runs inside a real browser tab.
 *
 *   node scripts/verify-tools.mjs http://127.0.0.1:4407/en/tools/chunk-preview/
 *
 * This is the one end-to-end path that needs no model download, so it can be
 * verified offline: drop a file into the island, then read back what the
 * *browser* produced (chunk count, per-chunk length and heading path).
 * The same chunker is covered by unit tests in src/lib/rag/chunk.test.ts —
 * this script proves those tests describe what actually ships.
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = process.argv[2] ?? 'http://127.0.0.1:4407/en/tools/chunk-preview/';
const PORT = 9334;

const SAMPLE = [
  '# 服务协议',
  '',
  '## 8.2 解约',
  '任一方提前 60 天书面通知即可解约。重大违约在解约权生效前另有 30 天补救期。',
  '',
  '## 9.1 费用',
  '双方各自承担己方产生的费用，并妥善保存相关凭证以备查验与核对之需。',
  '',
  '| 项目 | 期限 | 说明 |',
  '| --- | --- | --- |',
  '| 通知期 | 60 天 | 书面送达 |',
  '',
].join('\n');

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-proxy-server',
    '--no-first-run',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=E:/hermes-workspace/temp/cdp-tools',
    'about:blank',
  ],
  { stdio: 'ignore' }
);

let exitCode = 1;
try {
  await sleep(2500);
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const target = list.find((t) => t.type === 'page');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));

  let id = 0;
  const pending = new Map();
  const exceptions = [];
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      exceptions.push(msg.params.exceptionDetails?.exception?.description ?? 'unknown');
    }
  });
  const send = (method, params = {}) =>
    new Promise((res) => {
      const i = ++id;
      pending.set(i, res);
      ws.send(JSON.stringify({ id: i, method, params }));
    });

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.navigate', { url: URL });
  await sleep(5000);

  const mounted = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      drop: !!document.querySelector('.sr-drop'),
      islands: document.querySelectorAll('astro-island').length,
      hasTextarea: !!document.querySelector('.sr-textarea-lg')
    })`,
    returnByValue: true,
  });
  console.log('island:', mounted.result?.result?.value);

  // Drop a real File through the same code path a user's drag takes.
  const dropped = await send('Runtime.evaluate', {
    expression: `(() => {
      const dt = new DataTransfer();
      dt.items.add(new File([${JSON.stringify(SAMPLE)}], 'agreement.md', { type: 'text/markdown' }));
      const zone = document.querySelector('.sr-drop');
      if (!zone) return 'no drop zone';
      zone.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
      return 'dispatched';
    })()`,
    returnByValue: true,
  });
  console.log('drop:', dropped.result?.result?.value);

  await sleep(3500);

  const probe = await send('Runtime.evaluate', {
    expression: `JSON.stringify({
      chunks: document.querySelectorAll('.sr-chunks > li').length,
      heads: [...document.querySelectorAll('.sr-chunk-head')].map(n => n.innerText.replace(/\\n/g, ' | ')).slice(0, 4),
      summary: document.querySelector('.sr-hint')?.innerText ?? '',
      firstBody: document.querySelector('.sr-chunks > li p')?.innerText?.slice(0, 60) ?? '',
      error: document.querySelector('.sr-error')?.innerText ?? ''
    })`,
    returnByValue: true,
  });
  const result = JSON.parse(probe.result?.result?.value ?? '{}');
  console.log('\n=== 浏览器内分块结果 ===');
  console.log('chunk count :', result.chunks);
  console.log('first chunk :', result.firstBody);
  console.log('headings    :');
  for (const h of result.heads ?? []) console.log('   ', h);
  console.log('summary     :', result.summary);
  console.log('error       :', result.error || '(none)');
  console.log('exceptions  :', exceptions.length ? exceptions : '(none)');

  // The sample declares one heading and enough body text to clear the
  // minimum chunk size, so a working engine must produce at least one chunk
  // whose heading path carries the markdown heading.
  const ok =
    result.chunks > 0 &&
    (result.heads ?? []).some((h) => h.includes('服务协议')) &&
    !result.error &&
    exceptions.length === 0;
  console.log(ok ? '\n✓ PASS — the shipped chunker ran in the browser' : '\n✗ FAIL');
  exitCode = ok ? 0 : 1;
  ws.close();
} catch (error) {
  console.error('✗ verification error:', error);
} finally {
  chrome.kill();
}
process.exit(exitCode);
