// >>> rust-anything: core-rs is on. `rust-anything disable ../../native/core-rs` removes this block.
// @ts-ignore
const __rustAnything_core_rs = ((p) => p && p.env.RUST_ANYTHING_MODE !== 'old' && p.env.RUST_ANYTHING_UNIT_CORE !== 'original' && (() => { try { const m = p.getBuiltinModule('node:module'); const at = p.getBuiltinModule('node:path').join(__dirname, "../../native/core-rs/index.cjs"); return m.createRequire(at)(at) } catch (e) { if (p.env.RUST_ANYTHING_MODE === 'new') p.getBuiltinModule('node:assert').fail(e) } })())(globalThis.process)
// @ts-ignore
if (__rustAnything_core_rs) { nativeExtract = __rustAnything_core_rs.nativeExtract; exports.nativeExtract = nativeExtract }
// <<< rust-anything: core-rs
import {ExtractedInfo} from '../base';
import {matchTikTokData} from './links';

interface TikTokItem {
    id: string;
    video: {
        playAddr: string;
        downloadAddr: string;
        cover: string;
        duration: number;
    };
    music: {
        playUrl: string;
        title: string;
        authorName: string;
        id: string;
        coverLarge: string;
        album: string;
        duration: number;
    };
    author: string;
    authorId: string;
    avatarThumb: string;
    nickname: string;
    desc: string;
    stats: {
        playCount: number;
        shareCount: number;
        commentCount: number;
        diggCount: number;
    };
    createTime: string;
}

export function nativeExtract(html: string): ExtractedInfo {
    const matches = matchTikTokData(html);
    if (matches.length) {
        const page = JSON.parse(matches) as {
            ItemModule: Record<string, TikTokItem>;
        };
        const json = Object.values(page.ItemModule)[0];

        return {
            video: {
                id: json.id,
                urls: [json.video.playAddr, json.video.downloadAddr],
                thumb: json.video.cover,
                // Reason: the original returns the numeric duration even though the interface says string.
                duration: json.video.duration as unknown as string,
            },
            music: {
                url: json.music.playUrl,
                title: json.music.title,
                author: json.music.authorName,
                id: json.music.id,
                cover: json.music.coverLarge,
                album: json.music.album,
                duration: json.music.duration,
            },
            author: {
                username: json.author,
                id: json.authorId,
                thumb: json.avatarThumb,
                nick: json.nickname,
            },
            caption: json.desc,
            playsCount: json.stats.playCount,
            sharesCount: json.stats.shareCount,
            commentsCount: json.stats.commentCount,
            likesCount: json.stats.diggCount,
            uploadedAt: json.createTime,
        };
    } else {
        return {
            error: 'Something was wrong!',
        };
    }
}
