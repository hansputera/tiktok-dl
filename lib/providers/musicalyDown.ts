import { musicalyFetch } from '..';
import { handleException } from '../decorators';
import { BaseProvider, ExtractedInfo } from './baseProvider';

/**
 * @class MusicalyDown
 */
export class MusicalyDown extends BaseProvider {
    /**
     * 
     * @returns {string}
     */
    public resourceName() {
        return 'musicalydown';
    }

    /**
     * @returns {string}
     */
    public getURI() {
        return musicalyFetch.defaults.options.prefixUrl;
    }

    /**
     * 
     * @param {string} url - Video Tiktok URL
     * @returns {string}
     */
    @handleException()
    public async fetch(url: string): Promise<ExtractedInfo> {
        let headers = {
            "Accept": "*/*",
            "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
        };
        let res = await musicalyFetch('./', {
            headers
        });
        let form = {} as any;
        let tokens = (res.body.match(/input name="([^"]+)/gi) as string[]).map(x => x.split("\"").pop() as string);
        let token_value = (res.body.match(/type="hidden" value="(.*?)"/gi) as string[])[0].split(/=/g).pop()?.replace(/\"/g, '');
        let value = [url, token_value as string, "1"];
        for (let x in tokens) {
            form[tokens[x]] = value[x];
        }
        let cookie = res.headers['set-cookie']?.toString();
        const response = await musicalyFetch.post("./download", {
            form,
            headers: {
                cookie,
                ...headers
            },
            method: 'POST'
        }).text();
        return this.extract(response);
    }

    /**
     * 
     * @param {string} html - Raw HTML
     * @return {ExtractedInfo}
     */
    public extract(html: string): ExtractedInfo {
        let thumb = /img class="responsive-img" src="(.*?)"/gi.exec(html)?.[1];
        let match_urls = (html.match(/<a.*?target="_blank".*?href="(.*?)".*?<\/a>/gi) as string[]);
        let urls = match_urls.map(url => /<a.*?target="_blank".*?href="(.*?)".*?<\/a>/gi.exec(url)?.[1] as string);
        return {
            error: undefined,
            result: {
                urls,
                thumb
            }
        };
    }
}
