#!/usr/bin/env node
/**
 * Drop the onnxruntime WebAssembly copies that Vite emits into `dist/_astro`.
 *
 * Why they exist: `@huggingface/transformers` bundles onnxruntime-web, whose ESM
 * references its .wasm files through `new URL(..., import.meta.url)`. Vite sees
 * those as assets and emits hashed copies into `dist/_astro` — in this case two
 * copies of the same 25.6 MB file. The app never fetches them: `models.ts` points
 * `ort.env.wasm.wasmPaths` at `/ort/`, which `prepare-runtime.mjs` fills from
 * node_modules, and the network log of a real indexing run shows `/ort/...`
 * requests only.
 *
 * This runs after `astro build`, so the published site drops from ~140 MB to
 * ~89 MB. It is safe only because of that wasmPaths override — so the browser
 * end-to-end check must be re-run whenever this file changes, and it must never
 * touch `dist/ort/`.
 */
import { existsSync } from 'node:fs';
import { readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');
const ort = path.join(dist, 'ort');
if (!existsSync(ort)) {
  console.error('trim-dist: dist/ort is missing — run `npm run prepare:runtime` before building.');
  process.exit(1);
}

const astro = path.join(dist, '_astro');
if (!existsSync(astro)) {
  console.log('trim-dist: no dist/_astro, nothing to do');
  process.exit(0);
}

let removed = 0;
let freed = 0;
for (const name of await readdir(astro)) {
  if (!/^ort-wasm-.*\.wasm$/.test(name)) continue;
  const file = path.join(astro, name);
  freed += (await stat(file)).size;
  await unlink(file);
  removed++;
  console.log(`  removed ${name}`);
}

console.log(`trim-dist: ${removed} duplicate wasm file(s), ${(freed / 1048576).toFixed(1)} MB freed`);
