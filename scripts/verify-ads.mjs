#!/usr/bin/env node
/**
 * Count and exercise the ad slots in a real browser.
 *
 *   node scripts/verify-ads.mjs http://localhost:4321/zh/ [widthxheight]
 *
 * Checks the four things that are easy to get wrong and invisible in a build log:
 * six slots exist, the side rails appear only where a gutter can hold them, the
 * bottom slot collapses (and stops covering the footer while collapsed), and the
 * consent question is asked — with nothing loaded before it is answered.
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const CHROME = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TARGET = process.argv[2] ?? 'http://localhost:4321/zh/';
const SIZE = process.argv[3] ?? '1600x1000';
const PORT = 9345;

const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    `--window-size=${SIZE.replace('x', ',')}`,
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=E:/hermes-workspace/temp/cdp-ads-${SIZE.split('x')[0]}`,
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
  const external = [];
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
    if (m.method === 'Network.requestWillBeSent') {
      const url = m.params.request.url;
      if (!url.startsWith(new URL(TARGET).origin) && !url.startsWith('data:')) external.push(url);
    }
  });
  await send('Runtime.enable');
  await send('Network.enable');
  await sleep(2000);

  const evalJs = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    if (r.result?.exceptionDetails) console.log('  threw:', JSON.stringify(r.result.exceptionDetails).slice(0, 200));
    return r.result?.result?.value;
  };

  const survey = `(function(){
    var slots = Array.prototype.slice.call(document.querySelectorAll('.ad-slot'));
    var rows = slots.map(function (n) {
      var style = getComputedStyle(n);
      var shown = style.display !== 'none';
      var rect = n.getBoundingClientRect();
      return n.dataset.adVariant + ':' + n.dataset.adId + ' ' + (shown ? Math.round(rect.width) + 'x' + Math.round(rect.height) : 'HIDDEN');
    });
    var gate = document.querySelector('[data-consent-gate]');
    var anchor = document.querySelector('[data-ad-variant="anchor"]');
    var spacer = document.querySelector('[data-ad-spacer]');
    return JSON.stringify({
      count: slots.length,
      rows: rows,
      viewport: window.innerWidth + 'x' + window.innerHeight,
      consentAsked: !!(gate && !gate.hidden),
      anchorCollapsed: anchor ? anchor.dataset.collapsed : null,
      spacerHidden: spacer ? !!spacer.hidden : null,
    });
  })()`;

  console.log(`=== ${SIZE} ===`);
  const before = JSON.parse((await evalJs(survey)) ?? '{}');
  console.log('  广告位数量:', before.count, '| 视口:', before.viewport);
  for (const row of before.rows ?? []) console.log('    ', row);
  console.log('  询问同意（未作答前）:', before.consentAsked, '| 折叠状态:', before.anchorCollapsed, '| 占位隐藏:', before.spacerHidden);

  console.log('  --- 点击底部广告位的「收起」 ---');
  await evalJs(`(function(){var b=document.querySelector('[data-ad-collapse]');if(b){b.click();return 'clicked';}return 'no button';})()`);
  await sleep(400);
  const after = JSON.parse((await evalJs(survey)) ?? '{}');
  console.log('  折叠状态:', after.anchorCollapsed, '| 占位隐藏:', after.spacerHidden);
  const anchorRow = (after.rows ?? []).find((r) => r.startsWith('anchor'));
  console.log('  底部广告位尺寸:', anchorRow);

  console.log('  --- 页面在作答前发出的站外请求 ---');
  console.log('  站外请求:', external.length === 0 ? '无（符合承诺）' : external.slice(0, 5));

  exitCode = 0;
  ws.close();
} catch (e) {
  console.error('verify-ads error:', e);
} finally {
  chrome.kill();
}
process.exit(exitCode);
