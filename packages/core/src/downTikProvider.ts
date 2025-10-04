import {BaseProvider, ExtractedInfo} from './base';
import {getFetch} from '../fetch';
import {matchCustomDownload, matchLink, runObfuscatedScript} from './utils';
import {ZodObject} from 'zod';

/**
 * @class DownTikProvider
 */
export class DownTikProvider extends BaseProvider {
    /**
     * Get resource name
     *
     * @return {string}
     */
    public resourceName(): string {
        return 'downtik';
    }

    public client = getFetch('https://downtik.io');

    public maintenance = undefined;

    /**
     * @param {string} url
     *
     * @return {Promise<ExtractedInfo>}
     */
    async fetch(url: string): Promise<ExtractedInfo> {
        const response = await this.client('./', {
            searchParams: new URLSearchParams({
                lang: 'en',
            }),
        });

        const token = (
            response.body.match(/id="token" value="([^""]+)"/) as string[]
        )[1];

        const responseAction = await this.client.post('./action.php', {
            form: {
                url: url,
                token: token,
            },
            searchParams: new URLSearchParams({
                lang: 'en',
            }),
            headers: {
                cookie: response.headers['set-cookie']?.toString(),
                Referer: 'https://downtik.io/',
                Origin: 'https://downtik.io',
            },
        });

        try {
            if (JSON.parse(responseAction.body).error) {
                return {
                    error: JSON.parse(responseAction.body).message,
                };
            }
        } catch {
            // if JSON.parse fail
            return this.extract(responseAction.body);
        }

        return this.extract(responseAction.body);
    }

    /**
     * @param {string} html
     * @return {ExtractedInfo}
     */
    extract(html: string): ExtractedInfo {
        let urls = matchCustomDownload('downtik', html);

        if (!urls?.length) {
            urls = matchLink(runObfuscatedScript(html)) as string[];
            if (!urls?.length)
                return {
                    error: "Couldn't match any links!",
                };

            return {
                video: {
                    thumb: urls?.shift(),
                    urls: urls as string[],
                },
            };
        } else {
            return {
                music: {
                    url: urls.pop() as string,
                },
                video: {
                    thumb: urls?.shift(),
                    urls: urls as string[],
                },
            };
        }
    }

    /**
     * Get zod params.
     * @return {ZodObject | undefined}
     */
    public getParams(): ZodObject | undefined {
        return undefined;
    }
}
