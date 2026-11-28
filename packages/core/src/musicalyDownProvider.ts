import {ZodObject} from 'zod';
import {BaseProvider, ExtractedInfo} from './base';
import {musicalydownFetch} from './units/musicalydownFetch';
import {musicalydownExtract} from './units/musicalydownParse';

/**
 * @class MusicalyDown
 */
export class MusicalyDown extends BaseProvider {
    public baseUrl = 'https://musicaldown.com/id';
    /**
     *
     * @return {string}
     */
    public resourceName(): string {
        return 'musicalydown';
    }

    public maintenance = undefined;

    /**
     *
     * @param {string} url - Video Tiktok URL
     * @return {Promise<ExtractedInfo>}
     */
    public async fetch(url: string): Promise<ExtractedInfo> {
        return musicalydownFetch(url);
    }

    /**
     *
     * @param {string} body - Raw HTML
     * @return {ExtractedInfo}
     */
    public async extract(body: string): Promise<ExtractedInfo> {
        return musicalydownExtract(body);
    }

    /**
     * Get Params
     * @return {undefined}
     */
    public getParams(): undefined {
        return undefined;
    }
}
