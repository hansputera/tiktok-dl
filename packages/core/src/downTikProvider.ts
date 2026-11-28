import {BaseProvider, ExtractedInfo} from './base';
import {ZodObject} from 'zod';
import {downtikFetch} from './units/downtikFetch';
import {downtikExtract} from './units/downtikParse';

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

    public baseUrl = 'https://downtik.io';

    public maintenance = undefined;

    /**
     * @param {string} url
     *
     * @return {Promise<ExtractedInfo>}
     */
    async fetch(url: string): Promise<ExtractedInfo> {
        return downtikFetch(url);
    }

    /**
     * @param {string} html
     * @return {ExtractedInfo}
     */
    extract(html: string): ExtractedInfo {
        return downtikExtract(html, this.baseUrl);
    }

    /**
     * Get zod params.
     * @return {ZodObject | undefined}
     */
    public getParams(): ZodObject | undefined {
        return undefined;
    }
}
