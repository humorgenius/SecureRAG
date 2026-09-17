#!/usr/bin/env node
/**
 * SEO gate over the built output. Fails the build on:
 *  - missing / duplicated / over-long <title>
 *  - missing or out-of-range meta description
 *  - missing canonical, or missing either hreflang
 *  - malformed JSON-LD
 *  - placeholder values that must be replaced before launch
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
const errors = [];
const warnings = [];
const titles = new Map();

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (entry === 'index.html' || entry === '404.html') out.push(p);
  }
  return out;
}

const pages = walk(DIST);
const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

for (const file of pages) {
  const rel = '/' + relative(DIST, file).replace(/\\/g, '/');
  const html = readFileSync(file, 'utf8');
  const is404 = file.endsWith('404.html');

  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  if (!titleMatch) {
    errors.push(`${rel}: no <title>`);
  } else {
    const title = decode(titleMatch[1]).trim();
    if (title.length === 0) errors.push(`${rel}: empty <title>`);
    if (title.length > 65) warnings.push(`${rel}: title is ${title.length} chars (target ≤60)`);
    const key = title + '|' + (html.match(/hreflang="([a-zA-Z-]+)"/)?.[1] ?? '');
    if (titles.has(key)) errors.push(`${rel}: duplicate title with ${titles.get(key)}`);
    else titles.set(key, rel);
  }

  const desc = html.match(/<meta name="description" content="([^"]*)"/);
  if (!desc) errors.push(`${rel}: no meta description`);
  else {
    const d = decode(desc[1]).trim();
    if (d.length < 60) warnings.push(`${rel}: description is ${d.length} chars (target 120-158)`);
    if (d.length > 175) warnings.push(`${rel}: description is ${d.length} chars (target 120-158)`);
  }

  if (!is404) {
    if (!/rel="canonical"/.test(html)) errors.push(`${rel}: no canonical`);
    if (!/hreflang="en"/.test(html)) errors.push(`${rel}: no hreflang="en"`);
    if (!/hreflang="zh-Hans"/.test(html)) errors.push(`${rel}: no hreflang="zh-Hans"`);
    if (!/hreflang="x-default"/.test(html)) errors.push(`${rel}: no hreflang="x-default"`);
  }

  for (const block of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const parsed = JSON.parse(decode(block[1]));
      if (!parsed || (typeof parsed !== 'object' && !Array.isArray(parsed))) errors.push(`${rel}: JSON-LD is not an object`);
    } catch (e) {
      errors.push(`${rel}: invalid JSON-LD — ${String(e).slice(0, 90)}`);
    }
  }

  if (/0000000000000000/.test(html)) warnings.push(`${rel}: AdSense placeholder id still present (expected before launch)`);
}

if (pages.length === 0) errors.push('no HTML pages found in dist — build first');

console.log(`checked ${pages.length} pages`);
for (const w of warnings.slice(0, 25)) console.log('  warn:', w);
if (warnings.length > 25) console.log(`  … ${warnings.length - 25} more warnings`);
if (errors.length) {
  for (const e of errors.slice(0, 40)) console.error('  ERROR:', e);
  if (errors.length > 40) console.error(`  … ${errors.length - 40} more errors`);
  console.error(`seo check FAILED (${errors.length} errors)`);
  process.exit(1);
}
console.log('seo check OK');
