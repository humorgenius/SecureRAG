#!/usr/bin/env node
/**
 * i18n gate: every UI key must exist in both locales, and every content
 * collection entry must have a counterpart in the other language.
 * Run in CI before build — a failure here means a page would render with a
 * missing string or a one-language article.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const src = readFileSync('src/i18n/ui.ts', 'utf8');
let bad = 0;

function grabKeys(locale) {
  const m = src.match(new RegExp(`${locale}:\\s*\\{([\\s\\S]*?)\\n  \\}`, 'm'));
  if (!m) throw new Error(`cannot parse locale block: ${locale}`);
  return [...m[1].matchAll(/'([a-zA-Z0-9_.]+)':/g)].map((x) => x[1]).sort();
}

const en = grabKeys('en');
const zh = grabKeys('zh');
const missingZh = en.filter((k) => !zh.includes(k));
const missingEn = zh.filter((k) => !en.includes(k));
if (missingZh.length) {
  console.error('✗ keys missing in zh:', missingZh.join(', '));
  bad = 1;
}
if (missingEn.length) {
  console.error('✗ keys missing in en:', missingEn.join(', '));
  bad = 1;
}

// Nav entries reference dictionary keys by string, so a missing key silently
// renders an empty link. Validate the references, not just en/zh parity.
const navSrc = readFileSync('src/i18n/nav.ts', 'utf8');
const navKeys = [...navSrc.matchAll(/key:\s*'([^']+)'/g)].map((m) => m[1]);
const missingNav = [...new Set(navKeys.filter((k) => !en.includes(k)))];
if (missingNav.length) {
  console.error('✗ nav keys missing from ui.ts:', missingNav.join(', '));
  bad = 1;
}

const slugs = (dir) =>
  existsSync(dir) ? readdirSync(dir).filter((f) => /\.mdx?$/.test(f)).map((f) => f.replace(/\.mdx?$/, '')).sort() : [];

for (const collection of ['guides', 'blog']) {
  const base = `src/content/${collection}`;
  if (!existsSync(base)) continue;
  const enSlugs = slugs(`${base}/en`);
  const zhSlugs = slugs(`${base}/zh`);
  const onlyEn = enSlugs.filter((s) => !zhSlugs.includes(s));
  const onlyZh = zhSlugs.filter((s) => !enSlugs.includes(s));
  if (onlyEn.length) {
    console.error(`✗ ${collection}: missing zh translation for`, onlyEn.join(', '));
    bad = 1;
  }
  if (onlyZh.length) {
    console.error(`✗ ${collection}: missing en translation for`, onlyZh.join(', '));
    bad = 1;
  }
}

console.log(
  bad
    ? 'i18n check FAILED'
    : `i18n check OK — ${en.length} keys per locale, guides/blog slugs paired`
);
process.exit(bad);
