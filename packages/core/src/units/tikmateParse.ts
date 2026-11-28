// >>> rust-anything: core-rs is on. `rust-anything disable ../../native/core-rs` removes this block.
// @ts-ignore
const __rustAnything_core_rs = ((p) => p && p.env.RUST_ANYTHING_MODE !== 'old' && p.env.RUST_ANYTHING_UNIT_CORE !== 'original' && (() => { try { const m = p.getBuiltinModule('node:module'); const at = p.getBuiltinModule('node:path').join(__dirname, "../../native/core-rs/index.cjs"); return m.createRequire(at)(at) } catch (e) { if (p.env.RUST_ANYTHING_MODE === 'new') p.getBuiltinModule('node:assert').fail(e) } })())(globalThis.process)
// @ts-ignore
if (__rustAnything_core_rs) { tikmateExtract = __rustAnything_core_rs.tikmateExtract; exports.tikmateExtract = tikmateExtract }
// <<< rust-anything: core-rs
import {ExtractedInfo} from '../base';
import {matchLink} from './links';
import {deObfuscate} from './deobfuscate';

export function tikmateExtract(html: string): ExtractedInfo {
    const matchs = matchLink(deObfuscate(html));
    if (!matchs)
        return {
            error: "Couldn't match any links!",
        };

    return {
        video: {
            thumb: matchs.shift(),
            urls: matchs,
        },
    };
}
