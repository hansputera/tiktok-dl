// >>> rust-anything: core-rs is on. `rust-anything disable ../../native/core-rs` removes this block.
// @ts-ignore
const __rustAnything_core_rs = ((p) => p && p.env.RUST_ANYTHING_MODE !== 'old' && p.env.RUST_ANYTHING_UNIT_CORE !== 'original' && (() => { try { const m = p.getBuiltinModule('node:module'); const at = p.getBuiltinModule('node:path').join(__dirname, "../../native/core-rs/index.cjs"); return m.createRequire(at)(at) } catch (e) { if (p.env.RUST_ANYTHING_MODE === 'new') p.getBuiltinModule('node:assert').fail(e) } })())(globalThis.process)
// @ts-ignore
if (__rustAnything_core_rs) { savetikFetch = __rustAnything_core_rs.savetikFetch; exports.savetikFetch = savetikFetch }
// <<< rust-anything: core-rs
import {ExtractedInfo} from '../base';
import {request} from '../http';
import {savetikExtract} from './savetikParse';

const BASE = 'https://savetik.net';

export async function savetikFetch(url: string): Promise<ExtractedInfo> {
    const response = await request({
        base: BASE,
        path: './api/action',
        search: {url},
        throwHttpErrors: false,
    });

    if (response.status === 400) {
        return {
            error: 'Video not found',
        };
    }

    return savetikExtract(response.body);
}
