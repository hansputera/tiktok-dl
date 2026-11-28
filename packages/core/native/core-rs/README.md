# core-rs

napi addon behind `tiktok-dl-core`.

- `src/port.rs` — provider fetch/extract, link matching, deobfuscation entry points.
- `src/http.rs` — reqwest transport, or fixture replay from `TIKTOK_DL_HTTP_FIXTURES`.
- `src/jsengine.rs` — QuickJS evaluation of provider scripts.
- `index.cjs` — generated loader that converts structured arguments and results.

Built by `node ../scripts/build-native.mjs` (cargo release, then `libcore_rs.{dylib,so}`
copied to `core_rs.node`).
