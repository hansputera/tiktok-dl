import {getFetch} from '../fetch';
import {BaseProvider, ExtractedInfo, MaintenanceProvider} from './base';
import {deObfuscateSaveFromScript} from './utils';
import type {Shape} from 'ow';

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
        reason: 'Need advance investigate to Reverse Engineering the response scripts.'
    }

    /**
     *
     * @param {string} url - Video TikTok URL
     * @return {Promise<ExtractedInfo>}
     */
    public async fetch(url: string): Promise<ExtractedInfo> {
        const response = await this.client.post('./savefrom.php', {
            form: {
                sf_url: url,
                sf_submit: '',
                new: '2',
                lang: 'id',
                country: 'id',
                os: 'Ubuntu',
                browser: 'Firefox',
                channel: 'Downloader',
                'sf-nomad': '1',
                url,
                ts: Date.now(),
            },
            headers: {
                Origin: 'https://id.savefrom.net',
                Referer: 'https://id.savefrom.net',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            },
        });

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
     * Get ow.Shape params.
     * @return {Shape | undefined}
     */
    public getParams(): Shape | undefined {
        return undefined;
    }
}
