/** Get TikTok Video URL.
 * @param {string} url Video
 * @return {string}
 */
export function getTikTokURL(url: string): string | undefined {
    try {
        if (/^http(s?)(:\/\/)([a-z]+\.)*tiktok\.com\/(.+)$/gi.test(url)) {
            const u = new URL(url);
            u.search = ''; // cleanup params
            return u.href;
        } else {
            return undefined;
        }
    } catch {
        return undefined;
    }
}
