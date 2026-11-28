# Fixtures

Captured 2026-11-28 from the live providers, before the TypeScript implementation was removed.

- `http/<host>/<METHOD>-<sha1[0..16]>.json` — one HTTP exchange: `status`, `statusMessage`,
  `headers` (pairs), `body`, or `{"error": "..."}` when the transport failed.
- `http/index.jsonl` — capture log: method, URL, fixture file, status.
- `cases.jsonl` — what the TypeScript implementation returned for 63 inputs; `diff` matched all 63
  against the Rust port and `gate` passed.

Live: snaptik.app, tikmate.io, musicaldown.com, ttdownloader.com, savetik.net, tikdown.org,
downtik.io, www.fasttoksave.com, www.tiktok.com, en1.savefrom.net.
Synthetic (fallbacks when a provider body is unavailable): musicalydown extract, snaptik extract,
`deObfuscate` error paths, `matchLink` traps, savefrom script evaluation.

The Rust port replays these files through `TIKTOK_DL_HTTP_FIXTURES`. Recapturing needs the
removed TypeScript oracle: check out `0ffba838ec`, capture the responses with its HTTP layer,
record the outputs, then re-port and delete again.
