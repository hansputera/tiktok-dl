// >>> rust-anything: core-rs is on. `rust-anything disable ../../native/core-rs` removes this block.
// @ts-ignore
const __rustAnything_core_rs = ((p) => p && p.env.RUST_ANYTHING_MODE !== 'old' && p.env.RUST_ANYTHING_UNIT_CORE !== 'original' && (() => { try { const m = p.getBuiltinModule('node:module'); const at = p.getBuiltinModule('node:path').join(__dirname, "../../native/core-rs/index.cjs"); return m.createRequire(at)(at) } catch (e) { if (p.env.RUST_ANYTHING_MODE === 'new') p.getBuiltinModule('node:assert').fail(e) } })())(globalThis.process)
// @ts-ignore
if (__rustAnything_core_rs) { snaptikExtract = __rustAnything_core_rs.snaptikExtract; exports.snaptikExtract = snaptikExtract }
// <<< rust-anything: core-rs
import {ExtractedInfo} from '../base';
import {matchLink} from './links';
import {runObfuscatedReplaceEvalScript} from './deobfuscate';

export function snaptikExtract(html: string): ExtractedInfo {
    const scriptsResult = runObfuscatedReplaceEvalScript(html);
    const results = matchLink(scriptsResult);
    if (!results || !results.length) throw new Error('Broken');
    return {
        video: {
            thumb: results?.shift(),
            urls: [...new Set(results.slice(0, results.length - 1))],
        },
    };
}
