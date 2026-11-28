// >>> rust-anything: core-rs is on. `rust-anything disable ../../native/core-rs` removes this block.
// @ts-ignore
const __rustAnything_core_rs = ((p) => p && p.env.RUST_ANYTHING_MODE !== 'old' && p.env.RUST_ANYTHING_UNIT_CORE !== 'original' && (() => { try { const m = p.getBuiltinModule('node:module'); const at = p.getBuiltinModule('node:path').join(__dirname, "../../native/core-rs/index.cjs"); return m.createRequire(at)(at) } catch (e) { if (p.env.RUST_ANYTHING_MODE === 'new') p.getBuiltinModule('node:assert').fail(e) } })())(globalThis.process)
// @ts-ignore
if (__rustAnything_core_rs) { tikdownFetch = __rustAnything_core_rs.tikdownFetch; exports.tikdownFetch = tikdownFetch }
// <<< rust-anything: core-rs
import {ExtractedInfo} from '../base';
import {request} from '../http';
import {tikdownExtract} from './tikdownParse';

const BASE = 'https://tikdown.org';

export async function tikdownFetch(url: string): Promise<ExtractedInfo> {
    const response = await request({
        base: BASE,
        path: './',
        form: {
            'tiktok-url': url,
        },
    });

    const body = response.body;
    if (/please double/gi.test(body)) {
        return {
            error: 'Video not found',
        };
    }

    const indexLink = body.match(/\.\/index\.php\?url=[^'"]+/gi)?.at(0);
    if (!indexLink) {
        return {
            error: 'Couldnt find URL',
        };
    }

    const responseVideo = await request({base: BASE, path: indexLink});
    if (!responseVideo.body.length) {
        return {
            error: 'Couldnt find downloaded URL',
        };
    }

    return tikdownExtract(responseVideo.body, BASE);
}
