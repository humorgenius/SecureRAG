#!/usr/bin/env node
/**
 * Content gate for src/content/{guides,blog}/{en,zh}/*.mdx
 *
 *   node scripts/check-content.mjs         # report violations, exit 1 if any
 *   node scripts/check-content.mjs --fix   # trim over-long descriptions in place
 *
 * Astro's zod schema already enforces shape at build time, but a 253-character
 * meta description passes the schema's 180 limit check only if you set one — and
 * any description past ~160 characters is truncated in search results. So the
 * ceiling is enforced here, with real numbers, before the build.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const FIX = process.argv.includes('--fix');
const ROOT = 'src/content';
const COLLECTIONS = ['guides', 'blog'];
const LANGS = ['en', 'zh'];

const MAX = { title: 72, description: 180, descriptionZh: 180 };
const MIN = { description: 60, descriptionZh: 60 };

/** Trim at a sentence boundary when one exists, otherwise at a word boundary. */
function trimDescription(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('。'), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (lastStop >= 60) return cut.slice(0, lastStop + 1).trim();
  const lastSpace = cut.lastIndexOf(' ');
  const lastComma = cut.lastIndexOf('，');
  const at = Math.max(lastSpace, lastComma);
  return (at >= 60 ? cut.slice(0, at) : cut).trim();
}

const files = [];
for (const collection of COLLECTIONS) {
  for (const lang of LANGS) {
    const dir = join(ROOT, collection, lang);
    let entries = [];
    try {
      entries = readdirSync(dir).filter((f) => f.endsWith('.mdx'));
    } catch {
      continue;
    }
    for (const file of entries) files.push({ collection, lang, dir, file, path: join(dir, file) });
  }
}

if (files.length === 0) {
  console.error('✗ no content files found — expected src/content/<collection>/<lang>/*.mdx');
  process.exit(1);
}

const problems = [];
let fixed = 0;

for (const f of files) {
  let src = readFileSync(f.path, 'utf8');
  const fm = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) {
    problems.push(`${f.path}: no frontmatter block`);
    continue;
  }
  const get = (key) => {
    const m = fm[1].match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : null;
  };

  const title = get('title');
  const description = get('description');
  const lang = get('lang');
  const slug = get('slug');
  const minutes = get('minutes');
  const expectedSlug = f.file.replace(/\.mdx$/, '');

  if (!title) problems.push(`${f.path}: missing title`);
  else if (title.length > MAX.title) problems.push(`${f.path}: title ${title.length} > ${MAX.title}`);

  if (!description) problems.push(`${f.path}: missing description`);
  else {
    const max = f.lang === 'zh' ? MAX.descriptionZh : MAX.description;
    const min = f.lang === 'zh' ? MIN.descriptionZh : MIN.description;
    if (description.length > max || description.length < min) {
      if (FIX && description.length > max) {
        const trimmed = trimDescription(description, max);
        src = src.replace(/^description:.*$/m, `description: "${trimmed.replace(/"/g, "'")}"`);
        writeFileSync(f.path, src);
        fixed++;
        console.log(`  fixed ${f.path}: ${description.length} → ${trimmed.length}`);
      } else {
        problems.push(`${f.path}: description ${description.length} outside ${min}-${max}`);
      }
    }
  }

  if (lang !== f.lang) problems.push(`${f.path}: lang "${lang}" does not match directory "${f.lang}"`);
  if (slug !== expectedSlug) problems.push(`${f.path}: slug "${slug}" does not match filename "${expectedSlug}"`);
  if (!minutes || !/^\d+$/.test(minutes)) problems.push(`${f.path}: minutes "${minutes}" is not an integer`);
  if (!/^##\s+/m.test(src)) problems.push(`${f.path}: no "## " heading — the page TOC would be empty`);
}

const counts = {};
for (const f of files) counts[f.collection] = (counts[f.collection] ?? 0) + 1;
const byLang = {};
for (const f of files) byLang[`${f.collection}/${f.lang}`] = (byLang[`${f.collection}/${f.lang}`] ?? 0) + 1;
console.log(`\ncontent files: ${JSON.stringify(byLang)}`);

// Every slug must exist in both languages, or hreflang points at a 404.
for (const collection of COLLECTIONS) {
  const en = new Set(files.filter((f) => f.collection === collection && f.lang === 'en').map((f) => f.file));
  const zh = new Set(files.filter((f) => f.collection === collection && f.lang === 'zh').map((f) => f.file));
  for (const file of en) if (!zh.has(file)) problems.push(`${collection}: ${file} exists in en but not zh`);
  for (const file of zh) if (!en.has(file)) problems.push(`${collection}: ${file} exists in zh but not en`);
}

if (fixed) console.log(`\ntrimmed ${fixed} description(s)`);
if (problems.length) {
  console.error(`\n✗ ${problems.length} content problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log('\ncontent check OK');
