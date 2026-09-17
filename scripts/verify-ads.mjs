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
      midPct: (function () {
        var m = document.querySelector('[data-ad-id="banner-mid"]');
        var d = document.documentElement.scrollHeight;
        if (!m || !d) return null;
        return Math.round(((m.getBoundingClientRect().top + window.scrollY) / d) * 100);
      })(),
      anchorBox: (function () {
        var a = document.querySelector('[data-ad-variant="anchor"]');
        if (!a) return null;
        var r = a.getBoundingClientRect();
        return Math.round(r.width) + 'x' + Math.round(r.height);
      })(),
    });
  })()`;

  console.log(`=== ${SIZE} ===`);
  const before = JSON.parse((await evalJs(survey)) ?? '{}');
  console.log('  广告位数量:', before.count, '| 视口:', before.viewport);
  for (const row of before.rows ?? []) console.log('    ', row);
  console.log('  询问同意（未作答前）:', before.consentAsked, '| 折叠状态:', before.anchorCollapsed, '| 占位隐藏:', before.spacerHidden);
  console.log('  中部横幅位置:', before.midPct === null ? '（本页没有中部横幅）' : `约整页的 ${before.midPct}%`);
  console.log('  底部广告位占地:', before.anchorBox);

  console.log('  --- 点击底部广告位的「收起」 ---');
  await evalJs(`(function(){var b=document.querySelector('[data-ad-collapse]');if(b){b.click();return 'clicked';}return 'no button';})()`);
  await sleep(400);
  const after = JSON.parse((await evalJs(survey)) ?? '{}');
  console.log('  折叠状态:', after.anchorCollapsed, '| 占位隐藏:', after.spacerHidden);
  const anchorRow = (after.rows ?? []).find((r) => r.startsWith('anchor'));
  console.log('  折叠后尺寸:', anchorRow, '| 折叠后占地:', after.anchorBox);

  // Ground truth for "it disappeared": what the box and its arrow really are.
  const diag = await evalJs(`(function(){
    var a = document.querySelector('[data-ad-variant="anchor"]');
    var b = document.querySelector('[data-ad-collapse]');
    if (!a) return 'no anchor';
    var sa = getComputedStyle(a); var ra = a.getBoundingClientRect();
    var sb = b ? getComputedStyle(b) : null; var rb = b ? b.getBoundingClientRect() : null;
    return JSON.stringify({
      anchor: { rect: Math.round(ra.left)+','+Math.round(ra.top)+' '+Math.round(ra.width)+'x'+Math.round(ra.height),
        display: sa.display, visibility: sa.visibility, opacity: sa.opacity, position: sa.position,
        left: sa.left, right: sa.right, bottom: sa.bottom, transform: sa.transform,
        zIndex: sa.zIndex, overflow: sa.overflow, inlineHeight: a.style.height, inlineWidth: a.style.width },
      button: b ? { text: JSON.stringify(b.textContent), rect: Math.round(rb.width)+'x'+Math.round(rb.height),
        display: sb.display, color: sb.color, background: sb.backgroundColor, fontSize: sb.fontSize } : null,
      inViewport: ra.top < window.innerHeight && ra.bottom > 0,
      vh: window.innerHeight,
    });
  })()`);
  console.log('  折叠后真实情况:', diag);

  const corner = await send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 900, y: 700, width: 684, height: 205, scale: 1 },
  });
  if (corner.result?.data) {
    const { writeFileSync } = await import('node:fs');
    writeFileSync('E:/hermes-workspace/outputs/securerag/ad-collapsed.png', Buffer.from(corner.result.data, 'base64'));
    console.log('  角落截图: E:/hermes-workspace/outputs/securerag/ad-collapsed.png');
  }

  console.log('  --- 两侧竖幅的关闭 × ---');
  const railState = `(function(){
    var rails = Array.prototype.slice.call(document.querySelectorAll('[data-ad-variant="rail"]'));
    return JSON.stringify(rails.map(function (r) {
      var s = getComputedStyle(r);
      var box = r.querySelector('[data-ad-close]');
      var rb = box ? box.getBoundingClientRect() : null;
      return r.dataset.adId + ' ' + (s.display === 'none' ? 'HIDDEN' : 'shown') + ' ×' + (rb ? Math.round(rb.width) + 'x' + Math.round(rb.height) : 'none');
    }));
  })()`;
  console.log('  初始:', await evalJs(railState));
  await evalJs(`(function(){var b=document.querySelector('[data-ad-variant="rail"] [data-ad-close]');if(b){b.click();return 'clicked';}return 'no button';})()`);
  await sleep(300);
  console.log('  点左侧 × 之后:', await evalJs(railState));
  await evalJs('location.reload()');
  await sleep(3500);
  console.log('  跳转/刷新之后:', await evalJs(railState));

  console.log('  --- 回到顶部按钮 ---');
  const topCheck = await evalJs(`(function(){
    window.scrollTo(0, 1200);
    return JSON.stringify({scrolled: window.scrollY, buttonHiddenInDom: document.querySelector('[data-to-top]') ? document.querySelector('[data-to-top]').hidden : 'missing'});
  })()`);
  console.log('  滚动 1200px 后:', topCheck);
  await sleep(400);
  const visible = await evalJs(`(function(){var b=document.querySelector('[data-to-top]');if(!b)return 'missing';var r=b.getBoundingClientRect();var s=getComputedStyle(b);return JSON.stringify({hidden:b.hidden,display:s.display,rect:Math.round(r.width)+'x'+Math.round(r.height),bottom:Math.round(window.innerHeight-r.bottom),right:Math.round(window.innerWidth-r.right)});})()`);
  console.log('  按钮状态:', visible);
  await evalJs(`(function(){var b=document.querySelector('[data-to-top]');if(b)b.click();return 'clicked';})()`);
  await sleep(900);
  const afterClick = await evalJs('String(Math.round(window.scrollY))');
  console.log('  点击后 scrollY:', afterClick);

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
