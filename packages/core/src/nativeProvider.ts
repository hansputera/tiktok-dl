import {BaseProvider, ExtractedInfo} from './base';
import {nativeFetch} from './units/nativeFetch';
import {nativeExtract} from './units/nativeParse';
import z from 'zod';

/**
 * @class NativeProvider
 */
export class NativeProvider extends BaseProvider {
    /**
     * Get resource name.
     * @return {string}
     */
    public resourceName(): string {
        return 'native';
    }

    public maintenance = undefined;
    public baseUrl = undefined;

    /**
     * @param {string} url Tiktok video url
     * @param {Record<string, string>} params Advanced options.
     * @return {Promise<ExtractedInfo>}
     */
    async fetch(
        url: string,
        params: Record<string, string>,
    ): Promise<ExtractedInfo> {
        return nativeFetch(url, params);
    }

    /**
     * @param {string} html Raw HTML Data
     * @return {ExtractedInfo}
     */
    extract(html: string): ExtractedInfo {
        return nativeExtract(html);
    }

    /**
     * Return zod object for validation
     * @return {z.ZodObject}
     */
    public getParams(): z.ZodObject {
        return z.object({
            'user-agent': z.string().min(5),
        });
    }
}
