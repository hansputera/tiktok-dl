// >>> rust-anything: core-rs is on. `rust-anything disable ../../native/core-rs` removes this block.
// @ts-ignore
const __rustAnything_core_rs = ((p) => p && p.env.RUST_ANYTHING_MODE !== 'old' && p.env.RUST_ANYTHING_UNIT_CORE !== 'original' && (() => { try { const m = p.getBuiltinModule('node:module'); const at = p.getBuiltinModule('node:path').join(__dirname, "../../native/core-rs/index.cjs"); return m.createRequire(at)(at) } catch (e) { if (p.env.RUST_ANYTHING_MODE === 'new') p.getBuiltinModule('node:assert').fail(e) } })())(globalThis.process)
// @ts-ignore
if (__rustAnything_core_rs) { tikmateFetch = __rustAnything_core_rs.tikmateFetch; exports.tikmateFetch = tikmateFetch }
// <<< rust-anything: core-rs
import {ExtractedInfo} from '../base';
import {prefixUrl, request} from '../http';
import {tikmateExtract} from './tikmateParse';

const BASE = 'https://tikmate.io';
const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

export async function tikmateFetch(url: string): Promise<ExtractedInfo> {
    // we need to get the token

    const response = await request({
        base: BASE,
        path: './',
        headers: {
            'User-Agent': USER_AGENT,
        },
    });

    const matchs = response.body.match(
        /(name|id)="(\_)?token" value="([^""]+)"/,
    ) as string[];

    const cookies =
        response.headers['cookie'] || response.headers['set-cookie']?.toString();

    const abcResponse = await request({
        base: BASE,
        path: './abc.php',
        form: matchs.at(-1)
            ? {
                  url: url,
                  token: matchs.at(-1) as string,
              }
            : {
                  url: url,
              },
        headers: {
            Origin: prefixUrl(BASE),
            Referer: prefixUrl(BASE),
            Cookie: cookies,
            'User-Agent': USER_AGENT,
        },
    });

    return tikmateExtract(abcResponse.body);
}
