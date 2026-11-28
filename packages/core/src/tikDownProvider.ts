import {BaseProvider, ExtractedInfo} from './base';
import {ZodObject} from 'zod';
import {tikdownFetch} from './units/tikdownFetch';
import {tikdownExtract} from './units/tikdownParse';

/**
 * @class TikDownProvider
 */
export class TikDownProvider extends BaseProvider {
    /**
     * Get resource name.
     *
     * @return {string}
     */
    public resourceName(): string {
        return 'tikdown';
    }

    public baseUrl = 'https://tikdown.org';

    public maintenance = undefined;

    /**
     * @param {string} url
     *
     * @return {Promise<ExtractedInfo>}
     */
    async fetch(url: string): Promise<ExtractedInfo> {
        return tikdownFetch(url);
    }

    /**
     * @param {string} html
     * @return {ExtractedInfo}
     */
    extract(html: string): ExtractedInfo {
        return tikdownExtract(html, this.baseUrl);
    }

    /**
     * Get zod params
     * @return {ZodObject | undefined}
     */
    public getParams(): ZodObject | undefined {
        return undefined;
    }
}
