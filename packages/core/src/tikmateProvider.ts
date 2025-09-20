import {ZodObject} from 'zod';
import {getFetch} from '../fetch';
import {BaseProvider, ExtractedInfo} from './base';
import {deObfuscate, matchLink} from './utils';

/**
 * @class TikmateProvider
 */
export class TikmateProvider extends BaseProvider {
    public client = getFetch('https://tikmate.io');
    /**
     *
     * @return {string}
     */
    public resourceName(): string {
        return 'tikmate';
    }

    public maintenance = undefined;

    /**
     *
     * @param {string} url - Video TikTok URL
     * @return {Promise<ExtractedInfo>}
     */
    public async fetch(url: string): Promise<ExtractedInfo> {
        // we need to get the token

        const response = await this.client('./', {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            },
        });

        const matchs = response.body.match(
            /(name|id)="(\_)?token" value="([^""]+)"/,
        ) as string[];

        const cookies =
            response.headers['cookie'] ||
            response.headers['set-cookie']?.toString();

        const abcResponse = await this.client.post('./abc.php', {
            form: matchs.at(-1)
                ? {
                      url: url,
                      token: matchs.at(-1),
                  }
                : {
                      url: url,
                  },
            headers: {
                Origin: this.client.defaults.options.prefixUrl.toString(),
                Referer: this.client.defaults.options.prefixUrl.toString(),
                Cookie: cookies,
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            },
        });

        return this.extract(abcResponse.body);
    }

    /**
     * Extract information from raw html
     * @param {string} html - Raw HTML
     * @return {ExtractedInfo}
     */
    extract(html: string): ExtractedInfo {
        const matchs = matchLink(deObfuscate(html));
        if (!matchs)
            return {
                error: "Couldn't match any links!",
            };

        return {
            video: {
                thumb: matchs.shift(),
                urls: matchs,
            },
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
