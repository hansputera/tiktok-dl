import {BaseProvider, ExtractedInfo} from './base';
import {getFetch} from '../fetch';
import {ZodObject} from 'zod';

/**
 * @class TikDownProvider
 */
export class TikDownProvider extends BaseProvider {
    /**
     * Get resource name.
     *
     * @return {string}
     */
    public resourceName(): string {
        return 'tikdown';
    }

    public client = getFetch('https://tikdown.org');

    public maintenance = undefined;

    /**
     * @param {string} url
     *
     * @return {Promise<ExtractedInfo>}
     */
    async fetch(url: string): Promise<ExtractedInfo> {
        const response = await this.client.post('./', {
            form: {
                'tiktok-url': url,
            },
        });

        const body = response.body;
        if (/please double/gi.test(body)) {
            return {
                error: 'Video not found',
            };
        }

        const indexLink = body.match(/\.\/index\.php\?url=[^'"]+/gi)?.at(0);
        if (!indexLink) {
            return {
                error: 'Couldnt find URL',
            };
        }

        const responseVideo = await this.client.get(indexLink);
        if (!responseVideo.body.length) {
            return {
                error: 'Couldnt find downloaded URL',
            };
        }

        return this.extract(responseVideo.body);
    }

    /**
     * @param {string} html
     * @return {ExtractedInfo}
     */
    extract(html: string): ExtractedInfo {
        return {
            video: {
                urls: [
                    new URL(
                        `./${html}`,
                        this.client.defaults.options.prefixUrl.toString(),
                    ).href,
                ],
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
