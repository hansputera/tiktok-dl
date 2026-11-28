# tiktok-dl-core

The provider core of the TikTok downloader: a napi addon written in Rust, loaded by a small
CommonJS entry.

```
index.cjs              95 lines: loads the addon, builds the provider objects, zod params
index.d.ts             public types
native/core-rs/        Rust crate (reqwest + QuickJS)
fixtures/              63 recorded cases and their HTTP responses
scripts/build-native.mjs
```

There is no TypeScript implementation. The last one is preserved at commit `0ffba838ec` for
re-recording only.

## API

```ts
import {
  BaseProvider, Providers, getProvider, getRandomProvider,
  matchLink, matchTikTokData, matchCustomDownload, extractMusicalyDownImages,
  deObfuscate, runObfuscatedScript, runObfuscatedReplaceEvalScript,
  deObfuscateSaveFromScript,
  type ExtractedInfo, type MaintenanceProvider,
} from 'tiktok-dl-core';
```

`Providers` is ordered: `snaptik`, `tikmate`, `musicalydown`, `ttdownloader`, `savefrom`,
`savetik`, `tikdown`, `downtik`, `native`, `fasttoksave`. Each provider exposes:

| Member | Notes |
|---|---|
| `resourceName()` | registry name |
| `baseUrl` | site prefix; `undefined` for `native` |
| `getParams()` | zod schema only for `native` (`user-agent`), otherwise `undefined` |
| `maintenance` | `{reason}` for `savefrom`, otherwise `undefined` |
| `fetch(url, params?)` | returns `Promise<ExtractedInfo>` |
| `extract(html)` | returns `ExtractedInfo` or a promise |

`getProvider(name)` accepts a provider name or `random`; `getRandomProvider()` never returns
`native`. `ExtractedInfo` carries the optional `video`, `slides`, `music`, `author`, counters and
error fields used by the web app.

## Rust crate

```
src/providers/<name>.rs   fetch + extract per provider
src/providers/mod.rs      module list and re-exports
src/links.rs              URL and SIGI_STATE matching
src/deobfuscate.rs        deObfuscate, runObfuscated*, SaveFrom script evaluation
src/util.rs               JSON/undefined helpers, shared user agent
src/http.rs               reqwest, or fixture replay
src/jsengine.rs           QuickJS runtime per call (64 MiB heap, 2 s interrupt)
src/port.rs               re-exports consumed by the napi wrappers in lib.rs
src/lib.rs                napi wrappers and the binary wire
index.cjs                 structured-argument/result conversion and the public entry
```

`index.cjs` is the package `main`. It loads `native/core-rs/index.cjs` with
`createRequire(__filename)`, so a bundled server build must ship both files; the web app does
that through `outputFileTracingIncludes`.

## Build

```sh
node scripts/build-native.mjs     # cargo build --release, copy the library to core_rs.node
```

`CORE_RS_PREBUILT=1` skips cargo when the addon was built elsewhere (the Docker image uses this).

The script is also run by `apps/web`'s build, so Vercel and Docker compile the addon for their
own platform.

## Fixture replay

The addon reads `TIKTOK_DL_HTTP_FIXTURES`; when set to a directory, every provider request is
served from `<dir>/<host>/<method>-<key>.json` instead of the network. Unset means live requests
(production).

```sh
TIKTOK_DL_HTTP_FIXTURES="$PWD/packages/core/fixtures/http" \
  node -e "require('./packages/core').getProvider('tikmate')
    .fetch('https://www.tiktok.com/@raphaeltangg/video/7027045794377190658')
    .then((r) => console.log(r.video.urls.length))"
```

`fixtures/cases.jsonl` is the behavioral proof: 63 inputs, including the failing paths of the
broken providers. `fixtures/README.md` describes the file formats and recapture.

## Adding a provider

1. Add `native/core-rs/src/providers/<name>.rs` with `<name>_fetch(url) -> Result<Value, String>`
   and `<name>_extract(html) -> Result<Value, String>`, using `http::Request` and the helpers in
   `util.rs`.
2. Register it in `providers/mod.rs` (`pub mod` plus `pub use <name>::{...}`) and add both
   functions to the `providers` re-export list in `port.rs`.
3. Add the napi wrapper in `lib.rs` next to an existing provider (`#[napi(js_name = "<name>Fetch")]`,
   JSON string result, async when the provider fetches).
4. Add the provider to `definitions` in `index.cjs` and one `specs` entry each for
   `<name>Fetch` and `<name>Extract` (copy a neighbouring entry).
5. Add `maintenance` if the provider is disabled, and a zod schema only if it takes parameters.
6. Record cases and fixtures against the TypeScript oracle at `0ffba838ec`, then port; without
   that oracle new providers only have hand-written checks.

Provider order in `definitions` is the public `Providers` order and the web validator enum.

## Deployment

Vercel and Docker notes are in the [root README](../../README.md#deployment). The two
requirements are: build the addon on the target platform, and let the server bundle trace
`core_rs.node` (already configured in `apps/web/next.config.ts`).
