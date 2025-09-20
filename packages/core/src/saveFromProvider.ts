import got from 'got';
import {getFetch} from '../fetch';
import {BaseProvider, ExtractedInfo, MaintenanceProvider} from './base';
import {deObfuscateSaveFromScript} from './utils';

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

    public client = getFetch('https://worker.savefrom.net');

    public maintenance: MaintenanceProvider = {
        reason: 'Need further investigation.',
    };

    /**
     *
     * @param {string} url - Video TikTok URL
     * @return {Promise<ExtractedInfo>}
     */
    public async fetch(url: string): Promise<ExtractedInfo> {
        const responseFirst = await got.get('https://en1.savefrom.net');
        const response = await this.client.post('./savefrom.php', {
            form: {
                sf_url: url,
                sf_submit: '',
                new: '2',
                lang: 'en',
                country: 'id',
                os: 'Linux',
                browser: 'Brave',
                channel: 'main',
                'sf-nomad': '1',
                url,
                ts: Date.now(),
                _ts: Date.now(),
                _tsc: 0,
            },
            headers: {
                Origin: 'https://en1.savefrom.net',
                Referer: 'https://en1.savefrom.net',
                'User-Agent':
                    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
                Cookies: responseFirst.headers['set-cookie']?.toString(),
            },
        });

        console.log(response.body);

        return this.extract(response.body);
    }

    /**
     *
     * @param {string} html - HTML Raw
     * @return {ExtractedInfo}
     */
    extract(html: string): ExtractedInfo {
        const deobfuscated = deObfuscateSaveFromScript(html);
        const json = JSON.parse(
            (deobfuscated.match(/\({(.*)}\)/) as string[])[0].replace(
                /(\(|\))/g,
                '',
            ),
        );
        return {
            video: {
                thumb: json.thumb,
                id: json.id,
                urls: json.url.map((x: {url: string}) => x.url),
                duration: json.meta.duration,
                title: json.meta.title,
            },
        };
    }

    /**
     * Get params
     * @return {undefined}
     */
    public getParams(): undefined {
        return undefined;
    }
}
