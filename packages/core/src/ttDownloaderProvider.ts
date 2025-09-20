import {ZodObject} from 'zod';
import {getFetch} from '../fetch';
import {BaseProvider, ExtractedInfo} from './base';
import {matchLink} from './utils';

/**
 * @class TTDownloader
 */
export class TTDownloader extends BaseProvider {
    /**
     * @return {string}
     */
    public resourceName(): string {
        return 'ttdownloader';
    }

    public client = getFetch('https://ttdownloader.com');

    public maintenance = undefined;

    /**
     *
     * @param {string} url - Video TikTok URL
     * @return {Promise<ExtractedInfo>}
     */
    public async fetch(url: string): Promise<ExtractedInfo> {
        // getting token and cookies
        const firstResponse = await this.client('./');
        const token = (
            firstResponse.body.match(/name="token" value="(.*)?"/) as string[]
        )[1];
        const videoResponse = await this.client.post('./search', {
            form: {
                token: token,
                format: '',
                url: url,
            },
            headers: {
                Origin: 'https://ttdownloader.com',
                Referer: 'https://ttdownloader.com',
                Cookie: firstResponse.headers['set-cookie']?.toString(),
            },
        });

        return this.extract(videoResponse.body);
    }

    /**
     *
     * @param {string} html - HTML Raw
     * @return {ExtractedInfo}
     */
    extract(html: string): ExtractedInfo {
        const urls = matchLink(html);
        urls?.pop(); // remove 'https://snaptik.fans'

        const musicUrl = urls?.find((u) => /mp3/gi.test(u));
        return {
            video: {
                urls: urls?.filter((u) => u !== musicUrl) ?? [],
            },
            music: musicUrl
                ? {
                      url: musicUrl,
                  }
                : undefined,
        };
    }

    /**
     * Get zod params
     * @return {ZodObject | undefined}
     */
    public getParams(): ZodObject | undefined {
        return undefined;
    }
}
