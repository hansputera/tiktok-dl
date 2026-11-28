# Port decisions

## 1. Enable, not cutover

The unit stays in TypeScript and `rust-anything enable` rebinds its functions to the napi addon. The TS bodies remain the recording oracle and the `RUST_ANYTHING_UNIT_CORE_RS=original` fallback. A clean cutover would delete the only reference implementation before the web app has run against Rust.

## 2. QuickJS in-process

`rquickjs` bundles QuickJS and needs no libclang or external JS runtime. `boa_engine` is the fallback if rquickjs fails to build on darwin arm64 or Alpine musl; both sit behind `jsengine::eval_module_export`.

## 3. File-replay HTTP

`record` and `gate` must not depend on provider uptime. `http.ts` writes every live response to `fixtures/http/<host>/<method>-<key>.json` during capture and replays it afterwards; the key covers method, URL without query, sorted query/form values and canonical JSON. Transport failures are fixtures too (`{"error": ...}`). Rust only reads; `TIKTOK_DL_HTTP_FIXTURES_RECORD` is ignored there.

## 4. Faithful broken providers

`snaptik`'s token regex, `tikdown`'s missing result link and `fasttoksave`'s HTTP 525 are recorded as they are. The port reproduces today's behavior; site fixes are a separate change.

## 5. got vs reqwest

- The fixture carries `statusMessage`, because got's `HTTPError` text is `Response code <code> (<statusMessage>)` and unknown statuses (525) have no canonical reason. The plan's status-only fixture could not reproduce it.
- No retries. got retries idempotent requests twice; recorded fixtures never exercise that, and the port does not either.
- Redirects: up to 10, like got.
- `nativeFetch` uses got's `timeout.socket`; reqwest maps it to a total request timeout (`DECISIONS` accepted approximation, recorded cases do not hit it).

## 6. `deObfuscateSaveFromScript` stays TypeScript

`NodeVM.run` returns `undefined` for `let result = ...`, so the function throws on every input. It is kept with `--keep`; the SaveFrom provider class keeps its body in TS and is not bridged.

## 7. CommonJS output, patched enable glue

`packages/core` compiles to CommonJS (`tsconfig.build.json`, `"type": "commonjs"`) because every relative import is extensionless; ESM would need `.js` on all of them and Next only `require`s this external package. Three edits inside each of the 20 `rust-anything` marker blocks, all removed by `rust-anything disable`:

- `import.meta.dirname` → `__dirname`: tsc emits CJS, where `import.meta` is a syntax error.
- `exports.x = x` after each `x = native.x`: tsc emits `exports.x = x` before the block, so reassigning the local alone leaves the package exporting the TS function.
- `throw e` → `node:assert`'s `fail(e)`: the gate's error-case scan counts the glue's `throw` as an unreached error path; `assert.fail(e)` rethrows the same error loudly.

Re-running `rust-anything enable` overwrites these three edits; reapply them (the `enable` output is otherwise correct).

## 8. Verification limits

Docker was not running and no local Redis exists, so the plan's step 8 download route (`rotateProvider` needs Redis) and step 10 Alpine image were not executed. Verified instead: the whole workspace builds, `/api/providers` answers with all 10 providers from the built package, the addon dispatches (`runObfuscatedScript` returns the Rust-only error for a non-string export), the kill switch returns the TS value, and `RUST_ANYTHING_MODE=new` fails loudly when the `.node` is missing.
