import {ZodObject} from 'zod';
import {BaseProvider, ExtractedInfo, MaintenanceProvider} from './base';
import {fasttoksaveFetch} from './units/fasttoksaveFetch';
import {fasttoksaveExtract} from './units/fasttoksaveParse';

/**
 * @class FasttokSaveProvider
 */
export class FasttokSaveProvider extends BaseProvider {
    /**
     * Get provider resource name
     * @return {string}
     */
    public resourceName(): string {
        return 'fasttoksave';
    }

    public baseUrl = 'https://www.fasttoksave.com/';
    public maintenance?: MaintenanceProvider | undefined = undefined;

    /**
     * Fetch tiktok video resource
     * @param {string} url TikTok URL
     * @return {Promise<ExtractedInfo>}
     */
    async fetch(url: string): Promise<ExtractedInfo> {
        return fasttoksaveFetch(url);
    }

    /**
     * Extract contents from HTML raw
     * @param {string} html HTML Raw
     * @return {{}}
     */
    public extract(html: string): ExtractedInfo | Promise<ExtractedInfo> {
        return fasttoksaveExtract(html);
    }

    /**
     * Get params
     * @return {undefined}
     */
    public getParams(): ZodObject | undefined {
        return undefined;
    }
}
