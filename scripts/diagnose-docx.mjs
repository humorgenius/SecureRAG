#!/usr/bin/env node
/**
 * Reproduce the ".docx unsupported" report with a file we control.
 *
 *   node scripts/diagnose-docx.mjs <path-to-docx> [url]
 *
 * Drops a real DOCX through the same path a user's drag takes, then prints:
 *   - the error string the UI now shows (with its real detail)
 *   - every request the INGEST WORKER made (a 404 on a lazily imported chunk
 *     such as jszip/pako is invisible from the page and is a prime suspect)
 *   - console output and exceptions from both threads
 */
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const DOCX = process.argv[2] ?? 'E:/hermes-workspace/temp/sample.docx';
const TARGET = process.argv[3] ?? 'http://localhost:4321/zh/app/';
const PORT = 9339;

const b64 = readFileSync(DOCX).toString('base64');
console.log(`dropping ${basename(DOCX)} (${b64.length} base64 chars) into ${TARGET}`);

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--proxy-server=http://127.0.0.1:7897',
    '--no-first-run',
    `--remote-debugging-port=${PORT}`,
    // Reuse the profile that already has the embedding model cached, otherwise
    // the model download happens first and the drop never reaches the parser.
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
  const reqs = new Map();
  const done = [];
  const logs = [];

  const label = (sid) => (sid === undefined ? 'page' : `worker#${String(sid).slice(-4)}`);
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    const key = `${m.sessionId ?? 'page'}:${m.id}`;
    if (m.id && pending.has(key)) {
      pending.get(key)(m);
      pending.delete(key);
      return;
    }
    if (m.method === 'Target.attachedToTarget') {
      for (const d of ['Runtime.enable', 'Log.enable', 'Network.enable']) send(d, {}, m.params.sessionId);
      return;
    }
    if (m.method === 'Network.requestWillBeSent') reqs.set(`${m.sessionId}:${m.params.requestId}`, m.params.request.url);
    else if (m.method === 'Network.responseReceived') done.push({ sid: label(m.sessionId), url: m.params.response.url, status: m.params.response.status });
    else if (m.method === 'Network.loadingFailed')
      done.push({ sid: label(m.sessionId), url: reqs.get(`${m.sessionId}:${m.params.requestId}`) ?? '?', error: m.params.errorText });
    else if (m.method === 'Runtime.consoleAPICalled') {
      const t = (m.params.args ?? []).map((a) => a.value ?? a.description ?? '').join(' ').trim();
      if (t) logs.push(`[${label(m.sessionId)}:${m.params.type}] ${t.slice(0, 200)}`);
    } else if (m.method === 'Log.entryAdded') logs.push(`[${label(m.sessionId)}:${m.params.entry.level}] ${m.params.entry.text.slice(0, 200)}`);
    else if (m.method === 'Runtime.exceptionThrown')
      logs.push(`[${label(m.sessionId)}:exception] ${(m.params.exceptionDetails.exception?.description ?? '').slice(0, 240)}`);
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
  await send('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: false, flatten: true });
  await send('Page.navigate', { url: TARGET });
  await sleep(6000);

  const dropped = await send('Runtime.evaluate', {
    expression: `(() => {
      const bin = atob(${JSON.stringify(b64)});
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const file = new File([bytes], 'sample.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const z = document.querySelector('.sr-drop');
      if (!z) return 'no drop zone';
      const dt = new DataTransfer();
      dt.items.add(file);
      z.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
      return 'dropped ' + file.name + ' ' + file.size + 'B';
    })()`,
    returnByValue: true,
  });
  console.log('drop:', dropped.result?.result?.value);

  for (let i = 0; i < 5; i++) {
    await sleep(9000);
    const p = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        progress: document.querySelector('.sr-progress')?.innerText?.replace(/\\n/g,' ') ?? '',
        error: document.querySelector('.sr-error')?.innerText?.replace(/\\n/g,' ') ?? '',
        docs: document.querySelectorAll('.sr-doc').length
      })`,
      returnByValue: true,
    });
    const s = JSON.parse(p.result?.result?.value ?? '{}');
    console.log(`  [${(i + 1) * 9}s] docs=${s.docs} progress="${s.progress}"`);
    console.log(`         error="${s.error}"`);
    if (s.error || s.docs > 0) break;
  }

  const own = new URL(TARGET).origin;
  console.log('\n=== DOCX 相关的请求 + 全部失败请求 ===');
  const interesting = done.filter((d) => /docx|jszip|pako|chunk|\.js/i.test(d.url) || d.error || d.status >= 400);
  if (!interesting.length) console.log('  (none)');
  for (const d of interesting.slice(0, 20)) console.log(`  ${d.sid.padEnd(10)} ${(d.error ?? String(d.status)).padEnd(22)} ${d.url.slice(0, 120)}`);

  console.log('\n=== 控制台 / 异常（去重）===');
  if (!logs.length) console.log('  (none)');
  for (const l of [...new Set(logs)].slice(0, 20)) console.log('  ' + l);

  exitCode = 0;
  ws.close();
} catch (e) {
  console.error('diagnose error:', e);
} finally {
  chrome.kill();
}
process.exit(exitCode);
