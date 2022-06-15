import {BaseProvider, ExtractedInfo} from './base';
import {getFetch} from '../fetch';
import {matchLink} from './utils';
import {random as randomUA} from 'tiktok-dl-config/useragents';
import type {Shape} from 'ow';

/**
 * @class GetVidTikProvider
 */
export class GetVidTikProvider extends BaseProvider {
    /**
     * Get resource name
     *
     * @return {string}
     */
    public resourceName(): string {
        return 'getvidtik';
    }

    public client = getFetch('https://getvidtik.com');
    public maintenance = undefined;

    /**
     * @param {string} url TikTok Video URL
     * @return {Promise<ExtractedInfo>}
     */
    async fetch(url: string): Promise<ExtractedInfo> {
        // getting the token.
        const response = await this.client.get('./', {
            headers: {
                'User-Agent': randomUA(),
            },
        });

        const matchs = /name="token" type="hidden" value="([^""]+)"/.exec(
            response.body,
        );
        if (!matchs) {
            return {
                error: "Couldn't get the token.",
            };
        } else {
            // download request
            const downloadResponse = await this.client.post('./download', {
                headers: {
                    'User-Agent': randomUA(),
                    Cookie: response.headers['set-cookie']?.toString(),
                    Origin: this.client.defaults.options.prefixUrl.toString(),
                    Referer: response.url,
                },
                followRedirect: false,
                form: {
                    url,
                    token: matchs[1],
                },
            });

            if (downloadResponse.statusCode === 302) {
                return {
                    error: 'The video is private or removed. Please try again!',
                };
            } else {
                return this.extract(downloadResponse.body);
            }
        }
    }

    /**
     * Extract getVidTik Response
     * @param {string} html - Raw
     * @return {ExtractedInfo}
     */
    extract(html: string): ExtractedInfo {
        const matchs = matchLink(html);
        if (matchs) {
            const tiktokMatchs = matchs.filter((url) =>
                /http(s)?:\/\/(.*)\.tiktok(cdn)?\.com/gi.test(url),
            );

            if (tiktokMatchs) {
                const metadataMatchs = html
                    .match(/<td>(.+)<\/td>/)![0]
                    .split(/<.*?>/g)
                    .filter((x) => x.length);
                return {
                    video: {
                        thumb: tiktokMatchs[0],
                        urls: [tiktokMatchs[2], tiktokMatchs[3]], // [0] = no watermark, [1] = watermark
                    },
                    music: {
                        url: tiktokMatchs[tiktokMatchs.length - 1], // soon, i'll use '.at(-1)'
                    },
                    caption: metadataMatchs[3],
                    author: {
                        nick: metadataMatchs[1],
                    },
                };
            } else {
                return {
                    error: "Couldn't match tiktok links.",
                };
            }
        } else {
            return {
                error: "Couldn't match site links.",
            };
        }
    }

    /**
     * Get ow.Shape params.
     * @return {Shape | undefined}
     */
    public getParams(): Shape | undefined {
        return undefined;
    }
}
