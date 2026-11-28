import {BaseProvider, ExtractedInfo, MaintenanceProvider} from './base';
import {savefromFetch} from './units/savefromFetch';
import {savefromExtract} from './units/savefromParse';

/**
 * @class saveFromProvider
 */
export class SaveFromProvider extends BaseProvider {
    /**
     *
     * @return {string}
     */
    public resourceName(): string {
        return 'savefrom';
    }

    public baseUrl = 'https://worker.savefrom.net';

    public maintenance: MaintenanceProvider = {
        reason: 'Need further investigation.',
    };

    /**
     *
     * @param {string} url - Video TikTok URL
     * @return {Promise<ExtractedInfo>}
     */
    public async fetch(url: string): Promise<ExtractedInfo> {
        return savefromFetch(url);
    }

    /**
     *
     * @param {string} html - HTML Raw
     * @return {ExtractedInfo}
     */
    extract(html: string): ExtractedInfo {
        return savefromExtract(html);
    }

    /**
     * Get params
     * @return {undefined}
     */
    public getParams(): undefined {
        return undefined;
    }
}
