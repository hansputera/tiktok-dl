import {ZodObject} from 'zod';
import {getFetch} from '../fetch';
import {BaseProvider, ExtractedInfo, MaintenanceProvider} from './base';
import {matchLink, runObfuscatedReplaceEvalScript} from './utils';

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

    public maintenance?: MaintenanceProvider | undefined = undefined;

    /**
     *
     * @param {string} url - TikTok Video URL
     * @return {Promise<ExtractedInfo>}
     */
    public async fetch(url: string): Promise<ExtractedInfo> {
        // get token
        const responseToken = await this.client('./', {
            headers: {},
        });
        const token = (
            responseToken.body.match(
                /name="token" value="([^""]+)"/,
            ) as string[]
        )[1];

        const response = await this.client('./abc2.php', {
            searchParams: {
                url: url,
                token,
                lang: 'ID2',
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
        const scriptsResult = runObfuscatedReplaceEvalScript(html);
        const results = matchLink(scriptsResult);
        if (!results || !results.length) throw new Error('Broken');
        return {
            video: {
                thumb: results?.shift(),
                urls: [...new Set(results.slice(0, results.length - 1))],
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
