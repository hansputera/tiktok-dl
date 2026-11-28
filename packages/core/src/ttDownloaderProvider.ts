import {ZodObject} from 'zod';
import {BaseProvider, ExtractedInfo} from './base';
import {ttdownloaderFetch} from './units/ttdownloaderFetch';
import {ttdownloaderExtract} from './units/ttdownloaderParse';

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

    public baseUrl = 'https://ttdownloader.com';

    public maintenance = undefined;

    /**
     *
     * @param {string} url - Video TikTok URL
     * @return {Promise<ExtractedInfo>}
     */
    public async fetch(url: string): Promise<ExtractedInfo> {
        return ttdownloaderFetch(url);
    }

    /**
     *
     * @param {string} html - HTML Raw
     * @return {ExtractedInfo}
     */
    extract(html: string): ExtractedInfo {
        return ttdownloaderExtract(html);
    }

    /**
     * Get zod params
     * @return {ZodObject | undefined}
     */
    public getParams(): ZodObject | undefined {
        return undefined;
    }
}
