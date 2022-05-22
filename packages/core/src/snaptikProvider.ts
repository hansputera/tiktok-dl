import {getFetch} from '../fetch';
import {BaseProvider, ExtractedInfo} from './base';
import {deObfuscate, matchLink} from './utils';
import type {Shape} from 'ow';

/**
 * @class SnaptikProvider
 */
export class SnaptikProvider extends BaseProvider {
    public client = getFetch('https://snaptik.app/en');
    /**
     *
     * @return {string}
     */
    public resourceName(): string {
        return 'snaptik';
    }

    public maintenance = undefined;

    /**
     *
     * @param {string} url - TikTok Video URL
     * @return {Promise<ExtractedInfo>}
     */
    public async fetch(url: string): Promise<ExtractedInfo> {
        // get token
        const responseToken = await this.client('./');
        const token = (
            responseToken.body.match(
                /name="token" value="([^""]+)"/,
            ) as string[]
        )[1];

        const response = await this.client('./abc.php', {
            searchParams: {
                url: url,
                token,
            },
            headers: {
                Cookie: responseToken.headers['set-cookie']?.toString(),
            },
        });

        return this.extract(response.body);
    }

    /**
     * Extract information from raw html
     * @param {string} html - Raw HTML
     * @return {ExtractedInfo}
     */
    extract(html: string): ExtractedInfo {
        const results = matchLink(deObfuscate(html));
        if (!results || !results.length) throw new Error('Broken');
        return {
            video: {
                thumb: results?.shift(),
                urls: [...new Set(results.slice(0, results.length - 1))],
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
