import {ZodObject} from 'zod';
import {BaseProvider, ExtractedInfo} from './base';
import {tikmateFetch} from './units/tikmateFetch';
import {tikmateExtract} from './units/tikmateParse';

/**
 * @class TikmateProvider
 */
export class TikmateProvider extends BaseProvider {
    public baseUrl = 'https://tikmate.io';
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
        return tikmateFetch(url);
    }

    /**
     * Extract information from raw html
     * @param {string} html - Raw HTML
     * @return {ExtractedInfo}
     */
    extract(html: string): ExtractedInfo {
        return tikmateExtract(html);
    }

    /**
     * Get zod params
     * @return {ZodObject | undefined}
     */
    public getParams(): ZodObject | undefined {
        return undefined;
    }
}
