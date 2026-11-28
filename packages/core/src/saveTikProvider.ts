import {BaseProvider, ExtractedInfo} from './base';
import {ZodObject} from 'zod';
import {savetikFetch} from './units/savetikFetch';
import {savetikExtract} from './units/savetikParse';

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

    public baseUrl = 'https://savetik.net';

    public maintenance = undefined;

    /**
     * @param {string} url Video TikTok URL
     * @return {Promise<ExtractedInfo>}
     */
    async fetch(url: string): Promise<ExtractedInfo> {
        return savetikFetch(url);
    }

    /**
     * @param {string} html
     * @return {ExtractedInfo}
     */
    extract(html: string): ExtractedInfo {
        return savetikExtract(html);
    }

    /**
     * Get zod params
     * @return {ZodObject | undefined}
     */
    public getParams(): ZodObject | undefined {
        return undefined;
    }
}
