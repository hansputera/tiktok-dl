import {BaseProvider, ExtractedInfo} from './base';
import {getFetch} from '../fetch';
import {matchLink} from './utils';
import type {Shape} from 'ow';

/**
 * @class DDDTikProvider
 */
export class DDDTikProvider extends BaseProvider {
    /**
     * Get resource name
     *
     * @return {string}
     */
    public resourceName(): string {
        return 'dddtik';
    }

    public client = getFetch('https://dddtik.com');

    public maintenance = undefined;

    /**
     * @param {string} url Tiktok video url
     * @return {Promise<ExtractedInfo>}
     */
    async fetch(url: string): Promise<ExtractedInfo> {
        const response = await this.client.post('./down.php', {
            form: {
                url: url,
            },
        });

        return this.extract(response.body);
    }

    /**
     * @param {string} html
     * @return {ExtractedInfo}
     */
    extract(html: string): ExtractedInfo {
        const urls = matchLink(html) as string[];
        urls.pop();

        if (urls.length === 1) {
            return {
                error: 'Something went wrong!',
            };
        }

        const t = urls[1];
        return {
            video: {
                urls: urls.filter((u) => u !== t),
                thumb: t,
            },
        };
    }

    /**
     * Get ow.Shape params.
     * @return {Shape | undefined}
     */
    public getParams(): Shape | undefined {
        return undefined;
    }
}
