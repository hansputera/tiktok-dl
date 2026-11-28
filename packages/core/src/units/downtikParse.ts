// >>> rust-anything: core-rs is on. `rust-anything disable ../../native/core-rs` removes this block.
// @ts-ignore
const __rustAnything_core_rs = ((p) => p && p.env.RUST_ANYTHING_MODE !== 'old' && p.env.RUST_ANYTHING_UNIT_CORE !== 'original' && (() => { try { const m = p.getBuiltinModule('node:module'); const at = p.getBuiltinModule('node:path').join(__dirname, "../../native/core-rs/index.cjs"); return m.createRequire(at)(at) } catch (e) { if (p.env.RUST_ANYTHING_MODE === 'new') p.getBuiltinModule('node:assert').fail(e) } })())(globalThis.process)
// @ts-ignore
if (__rustAnything_core_rs) { downtikExtract = __rustAnything_core_rs.downtikExtract; exports.downtikExtract = downtikExtract }
// <<< rust-anything: core-rs
import {ExtractedInfo} from '../base';
import {matchCustomDownload, matchLink} from './links';
import {runObfuscatedScript} from './deobfuscate';

export function downtikExtract(
    html: string,
    baseUrl: string,
): ExtractedInfo {
    let urls = matchCustomDownload(baseUrl, html);

    if (!urls?.length) {
        urls = matchLink(runObfuscatedScript(html)) as string[];
        if (!urls?.length)
            return {
                error: "Couldn't match any links!",
            };

        return {
            video: {
                thumb: urls?.shift(),
                urls: urls as string[],
            },
        };
    } else {
        return {
            music: {
                url: urls.pop() as string,
            },
            video: {
                thumb: urls?.shift(),
                urls: urls as string[],
            },
        };
    }
}
