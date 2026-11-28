// >>> rust-anything: core-rs is on. `rust-anything disable ../../native/core-rs` removes this block.
// @ts-ignore
const __rustAnything_core_rs = ((p) => p && p.env.RUST_ANYTHING_MODE !== 'old' && p.env.RUST_ANYTHING_UNIT_CORE !== 'original' && (() => { try { const m = p.getBuiltinModule('node:module'); const at = p.getBuiltinModule('node:path').join(__dirname, "../../native/core-rs/index.cjs"); return m.createRequire(at)(at) } catch (e) { if (p.env.RUST_ANYTHING_MODE === 'new') p.getBuiltinModule('node:assert').fail(e) } })())(globalThis.process)
// @ts-ignore
if (__rustAnything_core_rs) { nativeFetch = __rustAnything_core_rs.nativeFetch; exports.nativeFetch = nativeFetch }
// <<< rust-anything: core-rs
import {ExtractedInfo} from '../base';
import {request} from '../http';
import {nativeExtract} from './nativeParse';

export async function nativeFetch(
    url: string,
    params: Record<string, string>,
): Promise<ExtractedInfo> {
    const urlInstance = new URL(url);
    const response = await request({
        base: urlInstance.origin,
        path: `.${urlInstance.pathname}`,
        headers: {
            Referer: urlInstance.href,
            Origin: urlInstance.origin,
            'User-Agent': params['user-agent'],
        },
        socketTimeoutMs: 10000,
    });

    return nativeExtract(response.body);
}
