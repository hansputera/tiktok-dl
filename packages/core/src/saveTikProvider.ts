import {BaseProvider, ExtractedInfo} from './base';
import {getFetch} from '../fetch';
import {matchLink, runObfuscatedReplaceEvalScript} from './utils';
import type {Shape} from 'ow';

/**
 * @class SaveTikProvider
 */
export class SaveTikProvider extends BaseProvider {
    /**
     * Get resource name
     *
     * @return {string}
     */
    public resourceName(): string {
        return 'savetik';
    }

    public client = getFetch('https://savetik.net');

    public maintenance = undefined;

    /**
     * @param {string} url Video TikTok URL
     * @return {Promise<ExtractedInfo>}
     */
    async fetch(url: string): Promise<ExtractedInfo> {
        const response = await this.client('./', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            },
        });
        const responseAction = await this.client.post('./action.php', {
            form: {
                url: url,
            },
            headers: {
                cookie: response.headers['set-cookie']?.toString(),
                Referer: 'https://savetik.net/',
                Origin: 'https://savetik.net',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            },
            searchParams: new URLSearchParams({
                lang: 'en2',
            }),
        });

        try {
            if (JSON.parse(responseAction.body).error) {
                return {
                    error: JSON.parse(responseAction.body).message,
                };
            }
        } finally {
            return this.extract(responseAction.body);
        }
    }

    /**
     * @param {string} html
     * @return {ExtractedInfo}
     */
    extract(html: string): ExtractedInfo {
        const results = runObfuscatedReplaceEvalScript(html);
        const matchUrls = matchLink(results) ?? [];

        const urls = matchUrls.filter(url => /(tiktokcdn|rapidcdn)/gi.test(url));

        return {
            music: {
                url: urls?.pop() as string,
            },
            video: {
                thumb: urls?.shift(),
                urls: urls as string[],
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
