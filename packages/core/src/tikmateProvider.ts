import {getFetch} from '../fetch';
import {BaseProvider, ExtractedInfo} from './base';
import {deObfuscate, matchCustomDownload, matchLink} from './utils';
import type {Shape} from 'ow';

/**
 * @class TikmateProvider
 */
export class TikmateProvider extends BaseProvider {
    public client = getFetch('https://tikmate.online');
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

        const response = await this.client('./');
        const matchs = response.body.match(
            /(name|id)="(\_)?token" value="([^""]+)"/,
        ) as string[];

        const cookies =
            response.headers['cookie'] ||
            response.headers['set-cookie']?.toString();

        const abcResponse = await this.client.post('./abc.php', {
            form: matchs
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
     * Get ow.Shape params.
     * @return {Shape | undefined}
     */
    public getParams(): Shape | undefined {
        return undefined;
    }
}
