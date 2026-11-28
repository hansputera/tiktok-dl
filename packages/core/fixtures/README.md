# Fixtures

Captured 2026-11-28 from the live providers.

- `http/<host>/<METHOD>-<sha1[0..16]>.json` — one HTTP exchange: `status`, `statusMessage`,
  `headers` (pairs), `body`, or `{"error": "..."}` when the transport failed.
- `http/index.jsonl` — capture log: method, URL, fixture file, status.
- `cases.jsonl` — the recorded behavior proof (`rust-anything record`); `cases.input.jsonl` is
  what `gen-cases.mjs` feeds into it.
- `urls.json` — the curated inputs.

Live: snaptik.app, tikmate.io, musicaldown.com, ttdownloader.com, savetik.net, tikdown.org,
downtik.io, www.fasttoksave.com, www.tiktok.com.
Synthetic (fallbacks when a provider body is unavailable): musicalydown extract, snaptik extract,
`deObfuscate` error paths, `matchLink` traps.

Recapture (deletes every fixture first):

```sh
rm -rf packages/core/fixtures/http
node packages/core/scripts/gen-cases.mjs
TIKTOK_DL_HTTP_FIXTURES="$PWD/packages/core/fixtures/http" \
TIKTOK_DL_HTTP_FIXTURES_RECORD=1 RUST_ANYTHING_CASE_TIMEOUT=120 \
  rust-anything record packages/core/native/core-rs --count 0 \
  --inputs packages/core/fixtures/cases.input.jsonl --ignore-key-order \
  --node-arg=--import=tsx --resolve-from "$PWD"
node packages/core/scripts/gen-cases.mjs
TIKTOK_DL_HTTP_FIXTURES="$PWD/packages/core/fixtures/http" RUST_ANYTHING_CASE_TIMEOUT=120 \
  rust-anything record packages/core/native/core-rs --count 0 \
  --inputs packages/core/fixtures/cases.input.jsonl --ignore-key-order \
  --node-arg=--import=tsx --resolve-from "$PWD"
```

Capture mode replays an existing fixture instead of fetching it again, so page tokens seeded by
the first request stay stable across the video/invalid cases.
