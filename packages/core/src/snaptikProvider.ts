import {ZodObject} from 'zod';
import {BaseProvider, ExtractedInfo, MaintenanceProvider} from './base';
import {snaptikFetch} from './units/snaptikFetch';
import {snaptikExtract} from './units/snaptikParse';

/**
 * @class SnaptikProvider
 */
export class SnaptikProvider extends BaseProvider {
    public baseUrl = 'https://snaptik.app/en';
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
        return snaptikFetch(url);
    }

    /**
     * Extract information from raw html
     * @param {string} html - Raw HTML
     * @return {ExtractedInfo}
     */
    extract(html: string): ExtractedInfo {
        return snaptikExtract(html);
    }

    /**
     * Get zod params
     * @return {ZodObject | undefined}
     */
    public getParams(): ZodObject | undefined {
        return undefined;
    }
}
