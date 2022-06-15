import {BaseProvider, ExtractedInfo} from './base';
import {getFetch} from '../fetch';
import {matchLink} from './utils';
import type {Shape} from 'ow';

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

    public client = getFetch('https://tikdown.org');

    public maintenance = undefined;

    /**
     * @param {string} url
     *
     * @return {Promise<ExtractedInfo>}
     */
    async fetch(url: string): Promise<ExtractedInfo> {
        const response = await this.client('./');

        const token = (
            response.body.match(/name="_token" value="([^""]+)"/) as string[]
        )[1];

        const responseAjax = await this.client.post('./getAjax', {
            form: {
                url: url,
                _token: token,
            },
            headers: {
                'x-csrf-token': token,
                cookie: response.headers['set-cookie']?.toString(),
            },
        });

        if (!JSON.parse(responseAjax.body).status) {
            return {
                error: 'Something was wrong',
            };
        }
        return this.extract(JSON.parse(responseAjax.body).html);
    }

    /**
     * @param {string} html
     * @return {ExtractedInfo}
     */
    extract(html: string): ExtractedInfo {
        const urls = matchLink(html) as string[];
        return {
            video: {
                thumb: urls.shift(),
                urls: urls.filter((url) =>
                    /http(s)?:\/\/td-cdn\.pw\/api.php\?download=(.+)\.mp(3|4)/gi.test(
                        url,
                    ),
                ),
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
