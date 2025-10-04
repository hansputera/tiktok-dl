import got from 'got';
import {getFetch} from '../fetch';
import {BaseProvider, ExtractedInfo} from './base';
import {extractMusicalyDownImages, matchLink} from './utils';

/**
 * @class MusicalyDown
 */
export class MusicalyDown extends BaseProvider {
    public client = getFetch('https://musicaldown.com/id');
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
        const res = await this.client('./', {
            headers: {
                Accept: '*/*',
                Referer: this.client.defaults.options.prefixUrl.toString(),
                Origin: this.client.defaults.options.prefixUrl.toString(),
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            },
        });

        const tokens = res.body.match(
            /input name="([^""]+)" type="hidden" value="([^""]+)"/,
        ) as string[];

        const response = await this.client.post('./download', {
            form: {
                [(res.body.match(/input name="([^"]+)/) as string[])[1]]: url,
                [tokens[1]]: tokens[2],
                verify: 1,
            },
            headers: {
                Cookie: res.headers['set-cookie']?.toString(),
                Accept: '*/*',
                Referer: this.client.defaults.options.prefixUrl.toString(),
                Origin: this.client.defaults.options.prefixUrl.toString(),
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            },
        });

        return this.extract(
            JSON.stringify({
                html: response.body,
                headers: {
                    Cookie: res.headers['set-cookie']?.toString(),
                    Accept: '*/*',
                    Referer: this.client.defaults.options.prefixUrl.toString(),
                    Origin: this.client.defaults.options.prefixUrl.toString(),
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                },
            }),
        );
    }

    /**
     *
     * @param {string} body - Raw HTML
     * @return {ExtractedInfo}
     */
    public async extract(body: string): Promise<ExtractedInfo> {
        const {html, headers} = JSON.parse(body);

        const urls = matchLink(html);
        const matchedUrls = urls?.filter((url) => /muscdn/gi.test(url)) ?? [];
        const musicalyDownUrls = extractMusicalyDownImages(html);

        const isSlide = musicalyDownUrls.length > 2;
        const nonImages = matchedUrls.filter((u) => u.includes('images'));
        const image = matchedUrls.find((u) => u.includes('images'));

        const info: ExtractedInfo = {
            video: {
                urls: !isSlide ? nonImages : [],
                thumb: image,
            },
            slides: isSlide ? musicalyDownUrls.slice(1) : undefined,
            author: !isSlide
                ? {
                      thumb: musicalyDownUrls[0],
                  }
                : undefined,
            music: !isSlide
                ? {
                      url: nonImages[0],
                  }
                : undefined,
        };

        if (isSlide) {
            const tokenRenderRegex = /data:\s*"([^"]+)"/;
            const token = tokenRenderRegex.exec(html)?.[1];

            const response = await got
                .post('https://render.muscdn.app/slider', {
                    form: {
                        data: token,
                    },
                    headers,
                })
                .json<{
                    success: boolean;
                    url?: string;
                }>();

            if (response.success && response.url?.length) {
                info.video = {
                    ...info.video,
                    urls: [response.url],
                };
            }
        }

        return info;
    }

    /**
     * Get Params
     * @return {undefined}
     */
    public getParams(): undefined {
        return undefined;
    }
}
