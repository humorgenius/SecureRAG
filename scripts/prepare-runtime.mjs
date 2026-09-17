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
  // Copy EVERY ort-wasm-* file: the .mjs loaders (tiny) and all wasm variants
  // (asyncify / jsep / jspi / plain simd-threaded).
  //
  // Do NOT "optimise" this list. The runtime picks a variant by feature
  // detection, and it changes with the environment: inside a Worker with no
  // cross-origin isolation (which is what GitHub Pages gives us) it falls back
  // to `asyncify`, while a WebGPU-capable browser asks for `jsep`. Shipping a
  // subset produced a 404 on ort-wasm-simd-threaded.asyncify.mjs and the load
  // failed with the opaque "No available adapters" — with the network working
  // perfectly. The browser only downloads the variant it selects, so the extra
  // variants cost repository size, never visitor bandwidth.
  for (const entry of readdirSync(ortDist)) {
    if (!/^ort-wasm-.*\.(mjs|wasm)$/.test(entry)) continue;
    copy(join(ortDist, entry), join(OUT, entry));
    copied++;
  }
} else {
  console.warn('! onnxruntime-web dist not found — run `npm install @huggingface/transformers`');
}

console.log(copied > 0 ? `runtime assets ready in public/ort (${copied} files)` : 'no runtime assets copied');
