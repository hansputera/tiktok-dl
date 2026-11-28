// >>> rust-anything: core-rs is on. `rust-anything disable ../../native/core-rs` removes this block.
// @ts-ignore
const __rustAnything_core_rs = ((p) => p && p.env.RUST_ANYTHING_MODE !== 'old' && p.env.RUST_ANYTHING_UNIT_CORE !== 'original' && (() => { try { const m = p.getBuiltinModule('node:module'); const at = p.getBuiltinModule('node:path').join(__dirname, "../../native/core-rs/index.cjs"); return m.createRequire(at)(at) } catch (e) { if (p.env.RUST_ANYTHING_MODE === 'new') p.getBuiltinModule('node:assert').fail(e) } })())(globalThis.process)
// @ts-ignore
if (__rustAnything_core_rs) { matchTikTokData = __rustAnything_core_rs.matchTikTokData; matchLink = __rustAnything_core_rs.matchLink; extractMusicalyDownImages = __rustAnything_core_rs.extractMusicalyDownImages; matchCustomDownload = __rustAnything_core_rs.matchCustomDownload; exports.matchTikTokData = matchTikTokData; exports.matchLink = matchLink; exports.extractMusicalyDownImages = extractMusicalyDownImages; exports.matchCustomDownload = matchCustomDownload }
// <<< rust-anything: core-rs
export function matchTikTokData(html: string): string {
    const data = html.match(
        // eslint-disable-next-line max-len
        /window\['SIGI_STATE'\]=(.*)<\/script><script id="__LOADABLE_REQUIRED_CHUNKS__" type="application\/json">/,
    );

    if (data) {
        return data[1].replace(/;window.+/gi, '');
    } else {
        return '';
    }
}

export function matchLink(raw: string): string[] | null {
    return raw.match(
        // eslint-disable-next-line max-len
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
    );
}

export function extractMusicalyDownImages(html: string): string[] {
    const regex = /<img[^>]+src="(https[^"]+)"/gi;
    return [...html.matchAll(regex)].map((m) => m[1]);
}

export function matchCustomDownload(
    baseUrl: string,
    raw: string,
): string[] {
    const links = matchLink(raw) as string[];
    const prefix = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    const urls = raw
        .match(/\/download.php\?token=(.*?)"/gi)
        ?.map((url) => prefix.slice(0, -1) + url.slice(0, -3));

    if (!urls?.length) return [];
    return [links[0]].concat(urls as string[]);
}
