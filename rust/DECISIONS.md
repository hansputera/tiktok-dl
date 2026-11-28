# Port decisions

## 1. Whole package in Rust

`packages/core` is the napi addon plus a 90-line CommonJS entry, `index.cjs`. The entry only loads
the addon, builds the ten provider objects with their `baseUrl`/`maintenance`/`getParams` and
re-exports the utility functions; every scraper, the HTTP transport, the deobfuscation and the
SaveFrom evaluation are Rust. There is no TypeScript fallback: a missing or broken addon fails at
require time.

The TypeScript oracle lived in the working tree only until commit `0ffba838ec`; it was recorded,
porting was checked with `rust-anything diff` (63/63) and `gate`, and then removed. `index.d.ts`
is the hand-written public contract, including `ExtractedInfo`, `BaseProvider` and the utility
types.

`getFetch` is gone: it was an accidental `fetch.ts` export of the `got` instance, unused by the
web app and meaningless next to the Rust transport.

## 2. QuickJS in-process

`rquickjs` bundles QuickJS and needs no libclang or external JS runtime. Each call gets a fresh
runtime with a 64 MiB heap, a 1 MiB stack and a 2 s interrupt handler. `deObfuscate` and the
`runObfuscated*` helpers read `module.exports`; `deObfuscateSaveFromScript` reads the assignment
value (`let result = <script>`), which is what NodeVM returned.

## 3. File-replay HTTP

`record` and `diff` never depend on provider uptime. `http.rs` reads
`TIKTOK_DL_HTTP_FIXTURES/<host>/<method>-<key>.json` when the variable is set, and otherwise
performs the request with reqwest. The key covers method, URL without query, sorted query/form
values and canonical JSON. Capture happened in the TypeScript transport before the cutover; the
Rust side is read-only.

## 4. Faithful broken providers

`snaptik` answers 404 (its token regex no longer matches), `tikdown` returns `Couldnt find URL`,
`fasttoksave` answers HTTP 525 (`Response code 525 (<none>)`), and SaveFrom fails. These are
recorded as they are; site fixes are a separate change.

## 5. SaveFrom

`deObfuscateSaveFromScript` wraps the input in `let result = ...` and evaluates it. A real
SaveFrom payload is an object expression, so the function returns an object and `savefromExtract`
fails at `deobfuscated.match is not a function` — that is the recorded behavior. The first
SaveFrom request (`https://en1.savefrom.net/`) currently fails at the transport level with an
empty message, recorded as `{"error": ""}`.

## 6. got vs reqwest

- The fixture carries `statusMessage`, because got's `HTTPError` text is
  `Response code <code> (<statusMessage>)` and unknown statuses (525) have no canonical reason.
- No retries. got retries idempotent requests twice; recorded fixtures never exercise that.
- Redirects: up to 10, like got.
- `nativeFetch` uses got's `timeout.socket`; reqwest maps it to a total request timeout, an
  accepted approximation no recorded case hits.
- Invalid URLs return `Invalid URL`; non-http(s) schemes return
  `Unsupported protocol: <scheme>:`.

## 7. CommonJS entry and zod

The napi addon is loaded by a CommonJS entry (`index.cjs`, `"type": "commonjs"`); Next
externalizes the package and `require`s it. `getParams()` for the `native` provider returns a zod
schema built in the entry (`z.object({'user-agent': z.string().min(5)})`), because a Rust function
cannot construct a zod object and the web route introspects `_zod.def.shape`.

Turbopack bundles workspace packages even when they are listed in `serverExternalPackages` and
rewrites `__dirname` inside them, so the addon cannot be found. The web app therefore builds and
dev-serves with webpack (`next dev`/`next build` without `--turbopack`) and lists
`tiktok-dl-core` in the server `externals`; `serverExternalPackages` stays for non-workspace
consumers.

## 8. Verification

At `0ffba838ec`: `rust-anything diff` 63/63, `gate` all checks pass. After the cutover, the
public entry replays all 63 cases: `Providers` fetch/extract through the provider objects and the
utility exports all match (`63/63`), `/api/providers` lists all ten providers, and a live
`tikmate` fetch without fixtures returns two URLs from reqwest.

Docker was not running and no local Redis exists, so the download route (rotator needs Redis) and
the Alpine image were not executed.
