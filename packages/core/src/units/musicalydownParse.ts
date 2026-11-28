// >>> rust-anything: core-rs is on. `rust-anything disable ../../native/core-rs` removes this block.
// @ts-ignore
const __rustAnything_core_rs = ((p) => p && p.env.RUST_ANYTHING_MODE !== 'old' && p.env.RUST_ANYTHING_UNIT_CORE !== 'original' && (() => { try { const m = p.getBuiltinModule('node:module'); const at = p.getBuiltinModule('node:path').join(__dirname, "../../native/core-rs/index.cjs"); return m.createRequire(at)(at) } catch (e) { if (p.env.RUST_ANYTHING_MODE === 'new') p.getBuiltinModule('node:assert').fail(e) } })())(globalThis.process)
// @ts-ignore
if (__rustAnything_core_rs) { musicalydownExtract = __rustAnything_core_rs.musicalydownExtract; exports.musicalydownExtract = musicalydownExtract }
// <<< rust-anything: core-rs
import {ExtractedInfo} from '../base';
import {request} from '../http';
import {extractMusicalyDownImages, matchLink} from './links';

export async function musicalydownExtract(
    body: string,
): Promise<ExtractedInfo> {
    const {html, headers} = JSON.parse(body);

    const urls = matchLink(html);
    const matchedUrls = urls?.filter((url) => /muscdn/gi.test(url)) ?? [];
    const musicalyDownUrls = extractMusicalyDownImages(html);

    const isSlide = musicalyDownUrls.length > 2;
    const nonImages = matchedUrls.filter((u) => u.includes('images'));
    const image = matchedUrls.find((u) => u.includes('images'));

    const info: ExtractedInfo = {
        video: {
            urls: !isSlide ? nonImages : [],
            thumb: image,
        },
        slides: isSlide ? musicalyDownUrls.slice(1) : undefined,
        author: !isSlide
            ? {
                  thumb: musicalyDownUrls[0],
              }
            : undefined,
        music: !isSlide
            ? {
                  url: nonImages[0],
              }
            : undefined,
    };

    if (isSlide) {
        const tokenRenderRegex = /data:\s*"([^"]+)"/;
        const token = tokenRenderRegex.exec(html)?.[1];

        const response = await request({
            base: 'https://render.muscdn.app',
            path: './slider',
            form: {
                data: token as string,
            },
            headers,
        });

        const json = JSON.parse(response.body) as {
            success: boolean;
            url?: string;
        };

        if (json.success && json.url?.length) {
            info.video = {
                ...info.video,
                urls: [json.url],
            };
        }
    }

    return info;
}
