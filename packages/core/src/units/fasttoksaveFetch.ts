// >>> rust-anything: core-rs is on. `rust-anything disable ../../native/core-rs` removes this block.
// @ts-ignore
const __rustAnything_core_rs = ((p) => p && p.env.RUST_ANYTHING_MODE !== 'old' && p.env.RUST_ANYTHING_UNIT_CORE !== 'original' && (() => { try { const m = p.getBuiltinModule('node:module'); const at = p.getBuiltinModule('node:path').join(__dirname, "../../native/core-rs/index.cjs"); return m.createRequire(at)(at) } catch (e) { if (p.env.RUST_ANYTHING_MODE === 'new') p.getBuiltinModule('node:assert').fail(e) } })())(globalThis.process)
// @ts-ignore
if (__rustAnything_core_rs) { fasttoksaveFetch = __rustAnything_core_rs.fasttoksaveFetch; exports.fasttoksaveFetch = fasttoksaveFetch }
// <<< rust-anything: core-rs
import {ExtractedInfo} from '../base';
import {request} from '../http';

const BASE = 'https://www.fasttoksave.com/';

export async function fasttoksaveFetch(url: string): Promise<ExtractedInfo> {
    const response = await request({
        base: BASE,
        path: './en/wp-json/tiktok-downloader/v1/fetch',
        json: {
            url,
        },
    });

    const json = JSON.parse(response.body) as {
        code: number;
        msg: string;
        data?: {
            author: {
                nickname: string;
                unique_id: string;
            };
            comment_count: number;
            play_count: number;
            cover: string;
            play: string;
            music_info: {
                author: string;
                cover: string;
                title: string;
            };
            wmplay: string;
            title: string;
            duration: number;
        };
    };

    if (json.code === -1 || !json.data) {
        return {
            error: 'Video not found.',
        };
    }

    return {
        video: {
            urls: [json.data.play, json.data.wmplay],
            thumb: json.data.cover,
            duration: (json.data.duration * 1000).toString(),
        },
        music: {
            url: '',
            author: json.data.music_info.author,
            cover: json.data.music_info.cover,
            title: json.data.music_info.title,
        },
        commentsCount: json.data.comment_count,
        playsCount: json.data.play_count,
        caption: json.data.title,
    };
}
