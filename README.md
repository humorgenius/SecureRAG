# SecureRAG

Ask questions across your documents without uploading them. Parsing, chunking,
embedding, retrieval and answering all run inside the browser tab. There is no
backend, no account system and no database — the site is a folder of static files.

## What is actually here

- **Astro 7** static output. Marketing pages ship no JavaScript beyond the language
  switcher; the tool is the only interactive island (Preact).
- **Bilingual by construction**: every page exists at both `/en/…` and `/zh/…`,
  pre-rendered, with `hreflang` and a full sitemap. Nothing is translated in the
  browser, so both languages are crawlable.
- **Local RAG engine** in `src/lib/rag/`: magic-byte format detection, structure-aware
  chunking, quantised ONNX embeddings in a Web Worker, hybrid retrieval
  (vectors + BM25 fused with RRF, de-duplicated with MMR), and cited answering.
- **One outbound request, ever**: the model weights on first use. Everything else
  runs on your machine, and the in-app network shield lists every request the page
  makes so you can check that claim yourself.

## Verify the privacy claim (about a minute)

1. Open the tool with DevTools → **Network** cleared.
2. Add a document. Watch the model download once.
3. Ask three questions. No further requests appear.
4. Switch DevTools to **Offline** and ask again — it still works.
5. Clear site data: the library is gone, because it only ever lived there.

## Develop

```bash
npm install
npm run prepare:runtime   # copies the PDF.js worker and onnxruntime wasm into public/ort
npm run dev
```

```bash
npm run test          # engine unit tests (chunking, BM25, RRF/MMR, extractive answers)
npm run check:i18n    # locale key parity + guides/blog slug pairing
npm run build         # static output in dist/
npm run check:seo     # titles, descriptions, canonical, hreflang, JSON-LD
```

## Structure

```
src/lib/rag/      engine: detect → parse → normalize → chunk → embed → index → retrieve → answer
src/workers/      ingest (parse+chunk+embed) and search (retrieve + generate) workers
src/components/   marketing sections, SEO head, and the app panels
src/data/pages/   long-form page content (one file per page, auto-registered)
src/data/sections/ hubs with child pages (compare, use-cases)
src/i18n/         UI strings per locale; the i18n gate fails the build on drift
scripts/          runtime asset prep, screenshot helper, i18n and SEO gates
```

## Deploy

Push to `main`; `.github/workflows/deploy.yml` builds and publishes to GitHub Pages.
Set `site` in `astro.config.mjs` and `public/CNAME` to your domain, and put your real
AdSense publisher id in `src/data/site.ts` and `public/ads.txt` before submitting.

## Limits we state up front

Encrypted PDFs, scans without a text layer and legacy `.doc` files are refused with a
reason. 25 MB per file, 40 files and 20,000 chunks per library. The default tier is
extractive (25 MB download, instant); fluent prose needs the optional local
generation tier (400 MB – 1 GB), and on CPU that is slow.
