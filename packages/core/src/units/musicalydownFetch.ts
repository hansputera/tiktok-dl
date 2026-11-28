// >>> rust-anything: core-rs is on. `rust-anything disable ../../native/core-rs` removes this block.
// @ts-ignore
const __rustAnything_core_rs = ((p) => p && p.env.RUST_ANYTHING_MODE !== 'old' && p.env.RUST_ANYTHING_UNIT_CORE !== 'original' && (() => { try { const m = p.getBuiltinModule('node:module'); const at = p.getBuiltinModule('node:path').join(__dirname, "../../native/core-rs/index.cjs"); return m.createRequire(at)(at) } catch (e) { if (p.env.RUST_ANYTHING_MODE === 'new') p.getBuiltinModule('node:assert').fail(e) } })())(globalThis.process)
// @ts-ignore
if (__rustAnything_core_rs) { musicalydownFetch = __rustAnything_core_rs.musicalydownFetch; exports.musicalydownFetch = musicalydownFetch }
// <<< rust-anything: core-rs
import {ExtractedInfo} from '../base';
import {prefixUrl, request} from '../http';
import {musicalydownExtract} from './musicalydownParse';

const BASE = 'https://musicaldown.com/id';
const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

export async function musicalydownFetch(
    url: string,
): Promise<ExtractedInfo> {
    const res = await request({
        base: BASE,
        path: './',
        headers: {
            Accept: '*/*',
            Referer: prefixUrl(BASE),
            Origin: prefixUrl(BASE),
            'User-Agent': USER_AGENT,
        },
    });

    const tokens = res.body.match(
        /input name="([^""]+)" type="hidden" value="([^""]+)"/,
    ) as string[];

    const response = await request({
        base: BASE,
        path: './download',
        form: {
            [(res.body.match(/input name="([^"]+)/) as string[])[1]]: url,
            [tokens[1]]: tokens[2],
            verify: 1,
        },
        headers: {
            Cookie: res.headers['set-cookie']?.toString(),
            Accept: '*/*',
            Referer: prefixUrl(BASE),
            Origin: prefixUrl(BASE),
            'User-Agent': USER_AGENT,
        },
    });

    return musicalydownExtract(
        JSON.stringify({
            html: response.body,
            headers: {
                Cookie: res.headers['set-cookie']?.toString(),
                Accept: '*/*',
                Referer: prefixUrl(BASE),
                Origin: prefixUrl(BASE),
                'User-Agent': USER_AGENT,
            },
        }),
    );
}
