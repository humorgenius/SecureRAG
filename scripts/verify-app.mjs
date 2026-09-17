#!/usr/bin/env node
/**
 * End-to-end verification of the tool page against a running static server.
 *
 *   node scripts/verify-app.mjs [url]
 *
 * Drives real Chrome over CDP (no extra dependencies — Node 22 has fetch and
 * WebSocket) and reports:
 *   - whether the Preact island mounted (not just whether HTML was served)
 *   - console exceptions and failed requests
 *   - every cross-origin request the page made
 *   - what happened after a synthetic drag-and-drop of a real File object
 *
 * Exit code is non-zero when the island fails to mount, because that is the
 * difference between "the page exists" and "the product works".
 */
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9333;
const URL = process.argv[2] ?? 'http://127.0.0.1:4399/en/app/';

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-proxy-server',
    '--no-first-run',
    '--hide-scrollbars',
    `--remote-debugging-port=${PORT}`,
    '--user-data-dir=E:/hermes-workspace/temp/cdp-profile',
    'about:blank',
  ],
  { stdio: 'ignore' }
);

const cleanup = () => {
  try {
    chrome.kill();
  } catch {}
};
process.on('exit', cleanup);

await sleep(2500);

const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const target = list.find((t) => t.type === 'page');
if (!target) {
  console.error('no page target — chrome failed to start');
  process.exit(2);
}

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve);
  ws.addEventListener('error', reject);
});

let counter = 0;
const pending = new Map();
const exceptions = [];
const consoleIssues = [];
const failedRequests = [];
const externalRequests = [];

ws.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
    return;
  }
  switch (msg.method) {
    case 'Runtime.exceptionThrown':
      exceptions.push(
        msg.params.exceptionDetails?.exception?.description ??
          msg.params.exceptionDetails?.text ??
          'unknown exception'
      );
      break;
    case 'Runtime.consoleAPICalled':
      if (['error', 'warning'].includes(msg.params.type)) {
        consoleIssues.push(
          `${msg.params.type}: ${msg.params.args.map((a) => a.value ?? a.description ?? a.type).join(' ')}`
        );
      }
      break;
    case 'Log.entryAdded':
      if (['error', 'warning'].includes(msg.params.entry.level)) {
        consoleIssues.push(`${msg.params.entry.level}: ${msg.params.entry.text}`);
      }
      break;
    case 'Network.loadingFailed':
      failedRequests.push(`${msg.params.type} ${msg.params.errorText}`);
      break;
    case 'Network.requestWillBeSent': {
      const url = msg.params.request.url;
      try {
        const parsed = new URL(url);
        if (parsed.origin !== new URL(URL).origin) externalRequests.push(parsed.host + parsed.pathname);
      } catch {}
      break;
    }
  }
});

const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++counter;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });

const evaluate = async (expression) => {
  const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (res.result?.exceptionDetails) return { error: res.result.exceptionDetails.text };
  return res.result?.result?.value;
};

await send('Runtime.enable');
await send('Log.enable');
await send('Network.enable');
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 950, deviceScaleFactor: 1, mobile: false });

console.log(`→ ${URL}`);
await send('Page.navigate', { url: URL });
await sleep(7000);

const mounted = await evaluate(`JSON.stringify({
  drop: !!document.querySelector('.sr-drop'),
  panels: document.querySelectorAll('.sr-panel').length,
  islands: document.querySelectorAll('astro-island').length,
  chat: !!document.querySelector('.sr-composer textarea'),
  shield: !!document.querySelector('.sr-shield'),
  bodyChars: document.body.innerText.length
})`);

console.log('\n=== 岛挂载情况 ===');
console.log(mounted);

// Visual evidence of the mounted workspace (the island renders client-side, so a
// plain --screenshot of the HTML would capture an empty shell).
const shot = await send('Page.captureScreenshot', { format: 'png' });
if (shot.result?.data) {
  const lang = URL.includes('/zh/') ? 'zh' : 'en';
  const out = `E:/hermes-workspace/outputs/securerag/app-${lang}.png`;
  writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
  console.log(`screenshot → ${out}`);
}

if (typeof mounted === 'string' && JSON.parse(mounted).drop) {
  // Instrument the app before interacting: record every worker message and every
  // window error, so "nothing happened" can be attributed to a specific stage.
  await evaluate(`(() => {
    window.__probe = { sent: [], errors: [] };
    const origPost = Worker.prototype.postMessage;
    Worker.prototype.postMessage = function (msg) {
      window.__probe.sent.push(msg && msg.type ? msg.type : String(msg));
      return origPost.apply(this, arguments);
    };
    window.addEventListener('error', (e) => window.__probe.errors.push(String(e.message)));
    window.addEventListener('unhandledrejection', (e) => window.__probe.errors.push('rejection: ' + String(e.reason && e.reason.message || e.reason)));
    return 'instrumented';
  })()`);

  console.log('\n=== 模拟拖拽上传一份 Markdown ===');
  await evaluate(`(() => {
    const zone = document.querySelector('.sr-drop');
    const dt = new DataTransfer();
    dt.items.add(new File(['# 服务协议\\n\\n## 第 8 条 解除\\n\\n任一方提前 60 天书面通知即可解约。重大违约另有 30 天补救期。\\n'], 'test-contract.md', { type: 'text/markdown' }));
    zone.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
    return 'dropped';
  })()`);

  let elapsed = 0;
  for (const wait of [6000, 10000, 30000]) {
    await sleep(wait);
    elapsed += wait;
    const state = await evaluate(`JSON.stringify({
      docs: document.querySelectorAll('.sr-doc').length,
      progress: (document.querySelector('.sr-progress')?.innerText || '').replace(/\\s+/g,' ').slice(0,120),
      error: (document.querySelector('.sr-error')?.innerText || '').slice(0,200),
      sent: (window.__probe && window.__probe.sent) || [],
      errs: (window.__probe && window.__probe.errors) || []
    })`);
    console.log(`  t+${Math.round(elapsed / 1000)}s:`, state);
    const parsed = JSON.parse(state);
    if (parsed.docs > 0 || parsed.error) break;
  }

  console.log('\n=== 提问 ===');
  await evaluate(`(() => {
    const ta = document.querySelector('.sr-composer textarea');
    ta.value = '解约通知期是多久？';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    const btn = [...document.querySelectorAll('.sr-composer button')].pop();
    btn.click();
    return 'asked';
  })()`);
  await sleep(12000);
  const answered = await evaluate(`JSON.stringify({
    q: document.querySelectorAll('.sr-q').length,
    a: document.querySelectorAll('.sr-a').length,
    answerText: (document.querySelector('.sr-a')?.innerText || '').replace(/\\s+/g,' ').slice(0, 300),
    citations: document.querySelectorAll('.sr-cite').length,
    sources: document.querySelectorAll('.sr-src').length
  })`);
  console.log(answered);
} else {
  console.log('岛未挂载 —— 后续交互测试跳过');
}

console.log('\n=== 控制台异常 ===');
console.log(exceptions.length ? exceptions.slice(0, 6).join('\n---\n') : '（无）');
console.log('\n=== 控制台 error/warn ===');
console.log(consoleIssues.length ? consoleIssues.slice(0, 8).join('\n') : '（无）');
console.log('\n=== 失败请求 ===');
console.log(failedRequests.length ? failedRequests.slice(0, 8).join('\n') : '（无）');
console.log('\n=== 跨域请求（应当只有模型权重）===');
console.log(externalRequests.length ? [...new Set(externalRequests)].join('\n') : '（无）');

ws.close();
cleanup();
process.exit(typeof mounted === 'string' && JSON.parse(mounted).drop ? 0 : 1);
