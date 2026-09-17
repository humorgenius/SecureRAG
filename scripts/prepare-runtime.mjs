#!/usr/bin/env node
/**
 * Copy the runtime assets the tool needs into public/ort/ so the page never
 * fetches them from a third-party CDN. This is part of the privacy promise:
 * after the model download, the only origin the browser talks to is ours.
 *
 * Sources:
 *   pdfjs-dist  → /ort/pdf.worker.min.mjs   (PDF parsing worker)
 *   onnxruntime-web → /ort/*.wasm, *.mjs    (embedding + generation runtime)
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const OUT = join(ROOT, 'public', 'ort');

const pdfjsWorker = join(ROOT, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.mjs');
const pdfjsWorkerAlt = join(ROOT, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.js');

function copy(from, to) {
  copyFileSync(from, to);
  console.log(`  copied ${to.split(/[\\/]/).slice(-1)[0]} (${(statSync(from).size / 1024).toFixed(0)} KB)`);
}

function findOrtDist() {
  const candidates = [
    join(ROOT, 'node_modules', 'onnxruntime-web', 'dist'),
    join(ROOT, 'node_modules', '@huggingface', 'transformers', 'node_modules', 'onnxruntime-web', 'dist'),
    join(ROOT, 'node_modules', 'onnxruntime-common', 'dist'),
  ];
  return candidates.find((dir) => existsSync(dir));
}

mkdirSync(OUT, { recursive: true });
let copied = 0;

if (existsSync(pdfjsWorker)) {
  copy(pdfjsWorker, join(OUT, 'pdf.worker.min.mjs'));
  copied++;
} else if (existsSync(pdfjsWorkerAlt)) {
  copy(pdfjsWorkerAlt, join(OUT, 'pdf.worker.min.js'));
  copied++;
} else {
  console.warn('! pdfjs-dist worker not found — run `npm install pdfjs-dist`');
}

const ortDist = findOrtDist();
if (ortDist) {
  // Only the wasm binaries are fetched at runtime (via wasmPaths). The .mjs
  // bundles in that folder are for the standalone onnxruntime-web API, which
  // transformers.js does not use, and shipping them would add ~8 MB for nothing.
  for (const entry of readdirSync(ortDist)) {
    if (!entry.endsWith('.wasm')) continue;
    if (/\.(jspi|asyncify)\./.test(entry)) continue;
    copy(join(ortDist, entry), join(OUT, entry));
    copied++;
  }
} else {
  console.warn('! onnxruntime-web dist not found — run `npm install @huggingface/transformers`');
}

console.log(copied > 0 ? `runtime assets ready in public/ort (${copied} files)` : 'no runtime assets copied');
