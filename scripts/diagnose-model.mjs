#!/usr/bin/env node
/**
 * Why does the local model fail to load? Captures the WORKER's network too.
 *
 *   node scripts/diagnose-model.mjs http://localhost:4321/zh/app/ [--no-proxy]
 *
 * Everything about model loading happens inside a Web Worker. CDP's Network
 * domain on the page target does not report a worker's requests, so an earlier
 * run of this script printed "(none)" and looked like "no request was ever
 * made". This version auto-attaches to worker targets (flatten mode) and
 * records requests per session, so the failing URL is visible.
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
// Named TARGET: a local `const URL` would shadow Node's global URL class.
const TARGET = (process.argv[2] ?? 'http://localhost:4321/zh/app/').replace(/^--.*/, '');
const PORT = 9337;
const USE_PROXY = !process.argv.includes('--no-proxy');

const SAMPLE = '# 服务协议\n\n## 8.2 解约\n任一方提前六十天书面通知即可解约。\n\n## 9.1 费用\n双方各自承担己方产生的费用。\n';

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    ...(USE_PROXY ? ['--proxy-server=http://127.0.0.1:7897'] : []),
    '--no-first-run',
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
  const reqs = new Map(); // `${sid}:${requestId}` -> url
  const done = []; // { sid, url, status|error }
  const logs = [];
  let workerCount = 0;

  const label = (sid) => (sid === undefined ? 'page' : `worker#${sid.slice(-4)}`);

  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    const key = `${m.sessionId ?? 'page'}:${m.id}`;
    if (m.id && pending.has(key)) {
      pending.get(key)(m);
      pending.delete(key);
      return;
    }
    if (m.method === 'Target.attachedToTarget') {
      const sid = m.params.sessionId;
      workerCount++;
      console.log(`  attached: ${m.params.targetInfo.type} ${m.params.targetInfo.url.slice(-40)}`);
      for (const domain of ['Runtime.enable', 'Log.enable', 'Network.enable']) send(domain, {}, sid);
      return;
    }
    if (m.method === 'Network.requestWillBeSent') {
      reqs.set(`${m.sessionId}:${m.params.requestId}`, m.params.request.url);
    } else if (m.method === 'Network.responseReceived') {
      done.push({ sid: label(m.sessionId), url: m.params.response.url, status: m.params.response.status });
    } else if (m.method === 'Network.loadingFailed') {
      done.push({
        sid: label(m.sessionId),
        url: reqs.get(`${m.sessionId}:${m.params.requestId}`) ?? '?',
        error: m.params.errorText,
        blocked: m.params.blockedReason,
      });
    } else if (m.method === 'Runtime.consoleAPICalled') {
      const text = (m.params.args ?? []).map((a) => a.value ?? a.description ?? '').join(' ').trim();
      if (text) logs.push(`[${label(m.sessionId)}:${m.params.type}] ${text.slice(0, 220)}`);
    } else if (m.method === 'Log.entryAdded') {
      logs.push(`[${label(m.sessionId)}:${m.params.entry.level}] ${m.params.entry.text.slice(0, 220)}`);
    } else if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      logs.push(`[${label(m.sessionId)}:exception] ${(d.exception?.description ?? d.text ?? '').slice(0, 260)}`);
    }
  });

  function send(method, params = {}, sessionId) {
    return new Promise((res) => {
      const i = ++seq;
      pending.set(`${sessionId ?? 'page'}:${i}`, res);
      ws.send(JSON.stringify({ id: i, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }

  await send('Runtime.enable');
  await send('Log.enable');
  await send('Network.enable');
  await send('Page.enable');
  // flatten:true + autoAttach makes workers reachable on this same socket.
  await send('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: false, flatten: true });
  await send('Page.navigate', { url: TARGET });
  await sleep(6000);

  const mounted = await send('Runtime.evaluate', {
    expression: `JSON.stringify({drop: !!document.querySelector('.sr-drop'), islands: document.querySelectorAll('astro-island').length})`,
    returnByValue: true,
  });
  console.log('island:', mounted.result?.result?.value);

  const dropped = await send('Runtime.evaluate', {
    expression: `(() => {
      const dt = new DataTransfer();
      dt.items.add(new File([${JSON.stringify(SAMPLE)}], 'agreement.md', { type: 'text/markdown' }));
      const z = document.querySelector('.sr-drop');
      if (!z) return 'no drop zone';
      z.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
      return 'dispatched';
    })()`,
    returnByValue: true,
  });
  console.log('drop:', dropped.result?.result?.value);

  for (let i = 0; i < 4; i++) {
    await sleep(12000);
    const p = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        progress: document.querySelector('.sr-progress')?.innerText?.replace(/\\n/g,' ') ?? '',
        error: document.querySelector('.sr-error')?.innerText?.replace(/\\n/g,' ') ?? '',
        docs: document.querySelectorAll('.sr-doc').length
      })`,
      returnByValue: true,
    });
    const s = JSON.parse(p.result?.result?.value ?? '{}');
    console.log(`  [${(i + 1) * 12}s] docs=${s.docs} progress="${s.progress}" error="${s.error}"`);
    if (s.error) break;
  }

  // Main chain, step 2: ask a question and read back the answer + citations.
  const asked = await send('Runtime.evaluate', {
    expression: `(() => {
      const ta = document.querySelector('textarea');
      const btn = [...document.querySelectorAll('button')].find((b) => /发送|Send/.test(b.innerText || ''));
      if (!ta || !btn) return 'no composer: textarea=' + !!ta + ' btn=' + !!btn;
      ta.value = '解约需要提前多久通知？';
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      btn.click();
      return 'asked';
    })()`,
    returnByValue: true,
  });
  console.log('ask:', asked.result?.result?.value);

  for (let i = 0; i < 3; i++) {
    await sleep(12000);
    // Plain function + forEach: exotic syntax inside a CDP expression fails
    // silently (the call returns exceptionDetails and value stays undefined).
    const expr =
      "(function(){var o={live:!!document.querySelector('.sr-a.is-live'),q:[],a:[],src:[],inferred:[]};" +
      "document.querySelectorAll('.sr-q').forEach(function(n){o.q.push(n.textContent.replace(/\\s+/g,' ').slice(0,80));});" +
      "document.querySelectorAll('.sr-a').forEach(function(n){o.a.push(n.textContent.replace(/\\s+/g,' ').slice(0,300));});" +
      "document.querySelectorAll('.sr-src').forEach(function(n){o.src.push(n.textContent.replace(/\\s+/g,' ').slice(0,140));});" +
      "document.querySelectorAll('.sr-inferred').forEach(function(n){o.inferred.push(n.textContent.slice(0,60));});" +
      "return JSON.stringify(o);})()";
    const a = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    if (a.result?.exceptionDetails) {
      console.log('  evaluate threw:', JSON.stringify(a.result.exceptionDetails).slice(0, 240));
    }
    const s = JSON.parse(a.result?.result?.value ?? '{}');
    console.log(`\n=== 问答采样 ${i + 1}（live=${s.live}）===`);
    console.log('  问题 :', (s.q ?? []).join(' / ') || '(none)');
    console.log('  回答 :', (s.a ?? []).join(' || ') || '(none)');
    console.log('  引用来源:', (s.src ?? []).length, '条');
    for (const c of (s.src ?? []).slice(0, 3)) console.log('     -', c);
    if ((s.a ?? []).length > 0 && !s.live) break;
  }

  const own = new URL(TARGET).origin;
  console.log('\n=== 全部请求（含 worker）===');
  if (done.length === 0) console.log('  (none)');
  for (const d of done.slice(0, 40)) {
    const mark = d.error ? `ERR ${d.error}` : String(d.status);
    const external = !d.url.startsWith(own) ? ' *external*' : '';
    console.log(`  ${d.sid.padEnd(10)} ${mark.padEnd(22)} ${d.url.slice(0, 120)}${external}`);
  }

  console.log('\n=== 控制台/异常（去重）===');
  if (logs.length === 0) console.log('  (none)');
  for (const l of [...new Set(logs)].slice(0, 25)) console.log('  ' + l);

  console.log(`\nworkers attached: ${workerCount}`);
  exitCode = 0;
  ws.close();
} catch (e) {
  console.error('diagnose error:', e);
} finally {
  chrome.kill();
}
process.exit(exitCode);
