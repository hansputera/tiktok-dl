// >>> rust-anything: core-rs is on. `rust-anything disable ../../native/core-rs` removes this block.
// @ts-ignore
const __rustAnything_core_rs = ((p) => p && p.env.RUST_ANYTHING_MODE !== 'old' && p.env.RUST_ANYTHING_UNIT_CORE !== 'original' && (() => { try { const m = p.getBuiltinModule('node:module'); const at = p.getBuiltinModule('node:path').join(__dirname, "../../native/core-rs/index.cjs"); return m.createRequire(at)(at) } catch (e) { if (p.env.RUST_ANYTHING_MODE === 'new') p.getBuiltinModule('node:assert').fail(e) } })())(globalThis.process)
// @ts-ignore
if (__rustAnything_core_rs) { snaptikFetch = __rustAnything_core_rs.snaptikFetch; exports.snaptikFetch = snaptikFetch }
// <<< rust-anything: core-rs
import {ExtractedInfo} from '../base';
import {request} from '../http';
import {snaptikExtract} from './snaptikParse';

const BASE = 'https://snaptik.app/en';

export async function snaptikFetch(url: string): Promise<ExtractedInfo> {
    // get token
    const responseToken = await request({
        base: BASE,
        path: './',
        headers: {},
    });
    const token = (
        responseToken.body.match(/name="token" value="([^""]+)"/) as string[]
    )[1];

    const response = await request({
        base: BASE,
        path: './abc2.php',
        search: {
            url: url,
            token,
            lang: 'ID2',
        },
        headers: {
            Cookie: responseToken.headers['set-cookie']?.toString(),
        },
    });

    return snaptikExtract(response.body);
}
