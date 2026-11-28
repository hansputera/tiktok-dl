// >>> rust-anything: core-rs is on. `rust-anything disable ../../native/core-rs` removes this block.
// @ts-ignore
const __rustAnything_core_rs = ((p) => p && p.env.RUST_ANYTHING_MODE !== 'old' && p.env.RUST_ANYTHING_UNIT_CORE !== 'original' && (() => { try { const m = p.getBuiltinModule('node:module'); const at = p.getBuiltinModule('node:path').join(__dirname, "../../native/core-rs/index.cjs"); return m.createRequire(at)(at) } catch (e) { if (p.env.RUST_ANYTHING_MODE === 'new') p.getBuiltinModule('node:assert').fail(e) } })())(globalThis.process)
// @ts-ignore
if (__rustAnything_core_rs) { downtikFetch = __rustAnything_core_rs.downtikFetch; exports.downtikFetch = downtikFetch }
// <<< rust-anything: core-rs
import {ExtractedInfo} from '../base';
import {request} from '../http';
import {downtikExtract} from './downtikParse';

const BASE = 'https://downtik.io';

export async function downtikFetch(url: string): Promise<ExtractedInfo> {
    const response = await request({
        base: BASE,
        path: './',
        search: {
            lang: 'en',
        },
    });

    const token = (
        response.body.match(/id="token" value="([^""]+)"/) as string[]
    )[1];

    const responseAction = await request({
        base: BASE,
        path: './action.php',
        search: {
            lang: 'en',
        },
        form: {
            url: url,
            token: token,
        },
        headers: {
            cookie: response.headers['set-cookie']?.toString(),
            Referer: 'https://downtik.io/',
            Origin: 'https://downtik.io',
        },
    });

    try {
        if (JSON.parse(responseAction.body).error) {
            return {
                error: JSON.parse(responseAction.body).message,
            };
        }
    } catch {
        // if JSON.parse fail
        return downtikExtract(responseAction.body, BASE);
    }

    return downtikExtract(responseAction.body, BASE);
}
