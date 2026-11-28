// >>> rust-anything: core-rs is on. `rust-anything disable ../../native/core-rs` removes this block.
// @ts-ignore
const __rustAnything_core_rs = ((p) => p && p.env.RUST_ANYTHING_MODE !== 'old' && p.env.RUST_ANYTHING_UNIT_CORE !== 'original' && (() => { try { const m = p.getBuiltinModule('node:module'); const at = p.getBuiltinModule('node:path').join(__dirname, "../../native/core-rs/index.cjs"); return m.createRequire(at)(at) } catch (e) { if (p.env.RUST_ANYTHING_MODE === 'new') p.getBuiltinModule('node:assert').fail(e) } })())(globalThis.process)
// @ts-ignore
if (__rustAnything_core_rs) { ttdownloaderFetch = __rustAnything_core_rs.ttdownloaderFetch; exports.ttdownloaderFetch = ttdownloaderFetch }
// <<< rust-anything: core-rs
import {ExtractedInfo} from '../base';
import {request} from '../http';
import {ttdownloaderExtract} from './ttdownloaderParse';

const BASE = 'https://ttdownloader.com';

export async function ttdownloaderFetch(url: string): Promise<ExtractedInfo> {
    // getting token and cookies
    const firstResponse = await request({base: BASE, path: './'});
    const token = (
        firstResponse.body.match(/name="token" value="(.*)?"/) as string[]
    )[1];
    const videoResponse = await request({
        base: BASE,
        path: './search',
        form: {
            token: token,
            format: '',
            url: url,
        },
        headers: {
            Origin: 'https://ttdownloader.com',
            Referer: 'https://ttdownloader.com',
            Cookie: firstResponse.headers['set-cookie']?.toString(),
        },
    });

    return ttdownloaderExtract(videoResponse.body);
}
