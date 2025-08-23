import {getFetch} from '../fetch';
import {BaseProvider, ExtractedInfo} from './base';
import type {Shape} from 'ow';
import { matchLink } from './utils';

/**
 * @class MusicalyDown
 */
export class MusicalyDown extends BaseProvider {
    public client = getFetch('https://musicaldown.com/id');
    /**
     *
     * @return {string}
     */
    public resourceName(): string {
        return 'musicalydown';
    }

    public maintenance = undefined;

    /**
     *
     * @param {string} url - Video Tiktok URL
     * @return {Promise<ExtractedInfo>}
     */
    public async fetch(url: string): Promise<ExtractedInfo> {
        const res = await this.client('./', {
            headers: {
                Accept: '*/*',
                Referer: this.client.defaults.options.prefixUrl.toString(),
                Origin: this.client.defaults.options.prefixUrl.toString(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
            },
        });

        const tokens = res.body.match(
            /input name="([^""]+)" type="hidden" value="([^""]+)"/,
        ) as string[];

        const response = await this.client.post('./download', {
            form: {
                [(res.body.match(/input name="([^"]+)/) as string[])[1]]: url,
                [tokens[1]]: tokens[2],
                verify: 1,
            },
            headers: {
                Cookie: res.headers['set-cookie']?.toString(),
                Accept: '*/*',
                Referer: this.client.defaults.options.prefixUrl.toString(),
                Origin: this.client.defaults.options.prefixUrl.toString(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            },
        });

        return this.extract(response.body);
    }

    /**
     *
     * @param {string} html - Raw HTML
     * @return {ExtractedInfo}
     */
    public extract(html: string): ExtractedInfo {
        const urls = matchLink(html);

        const matchedUrls = urls?.filter(url => /muscdn/gi.test(url)) ?? [];

        return {
            video: {
                urls: matchedUrls.filter(murl => !murl.includes('images')),
                thumb: matchedUrls.find(murl => murl.includes('images')),
            },
        };
    }

    /**
     * Get ow.Shape params.
     * @return {Shape | undefined}
     */
    public getParams(): Shape | undefined {
        return undefined;
    }
}
