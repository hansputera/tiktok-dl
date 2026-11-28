# core-rs

napi addon behind `tiktok-dl-core`.

- `src/providers/<name>.rs` — one provider per file (`snaptik`, `tikmate`, `musicalydown`,
  `ttdownloader`, `savefrom`, `savetik`, `tikdown`, `downtik`, `native`, `fasttoksave`), with its
  `fetch` and `extract`.
- `src/links.rs` — URL and SIGI_STATE matching.
- `src/deobfuscate.rs` — `deObfuscate`, `runObfuscated*`, SaveFrom script evaluation.
- `src/util.rs` — JSON/undefined helpers and the shared user agent.
- `src/http.rs` — reqwest transport, or fixture replay from `TIKTOK_DL_HTTP_FIXTURES`.
- `src/jsengine.rs` — QuickJS evaluation of provider scripts.
- `src/port.rs` — re-exports used by the generated napi wrappers in `lib.rs`.
- `index.cjs` — generated loader that converts structured arguments and results.

Built by `node ../scripts/build-native.mjs` (cargo release, then `libcore_rs.{dylib,so}`
copied to `core_rs.node`).
