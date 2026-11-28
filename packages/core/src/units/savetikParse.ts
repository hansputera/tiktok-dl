// >>> rust-anything: core-rs is on. `rust-anything disable ../../native/core-rs` removes this block.
// @ts-ignore
const __rustAnything_core_rs = ((p) => p && p.env.RUST_ANYTHING_MODE !== 'old' && p.env.RUST_ANYTHING_UNIT_CORE !== 'original' && (() => { try { const m = p.getBuiltinModule('node:module'); const at = p.getBuiltinModule('node:path').join(__dirname, "../../native/core-rs/index.cjs"); return m.createRequire(at)(at) } catch (e) { if (p.env.RUST_ANYTHING_MODE === 'new') p.getBuiltinModule('node:assert').fail(e) } })())(globalThis.process)
// @ts-ignore
if (__rustAnything_core_rs) { savetikExtract = __rustAnything_core_rs.savetikExtract; exports.savetikExtract = savetikExtract }
// <<< rust-anything: core-rs
import {ExtractedInfo} from '../base';

export function savetikExtract(html: string): ExtractedInfo {
    try {
        const json = JSON.parse(html);
        if (json.error) {
            return {
                error: json.error,
            };
        }

        return {
            video: {
                urls: [json.downloadUrl, json.hdDownloadUrl],
                title: json.postinfo.media_title,
                duration: json.duration.toString(),
            },
            slides: json.items ?? undefined,
            author: {
                username: json.postinfo.unique_id,
                id: json.postinfo.uid,
                nick: json.postinfo.username,
                thumb: json.postinfo.avatar_url,
            },
            sharesCount: json.stats.shareCount,
            playsCount: json.stats.playCount,
            commentsCount: json.stats.commentCount,
        };
    } catch {
        return {
            error: 'Video not found',
        };
    }
}
