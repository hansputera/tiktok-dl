import {BaseProvider, ExtractedInfo} from './base';
import {getFetch} from '../fetch';
// import {matchLink, runObfuscatedReplaceEvalScript} from './utils';
import type {Shape} from 'ow';

/**
 * @class SaveTikProvider
 */
export class SaveTikProvider extends BaseProvider {
    /**
     * Get resource name
     *
     * @return {string}
     */
    public resourceName(): string {
        return 'savetik';
    }

    public client = getFetch('https://savetik.net');

    public maintenance = undefined;

    /**
     * @param {string} url Video TikTok URL
     * @return {Promise<ExtractedInfo>}
     */
    async fetch(url: string): Promise<ExtractedInfo> {
        const response = await this.client.get('./api/action', {
            searchParams: new URLSearchParams({
                url,
            }),
            throwHttpErrors: false,
        });

        if (response.statusCode === 400)
        {
            return {
                error: 'Video not found',
            };
        }

        return this.extract(response.body);
    }

    /**
     * @param {string} html
     * @return {ExtractedInfo}
     */
    extract(html: string): ExtractedInfo {
        // const results = runObfuscatedReplaceEvalScript(html);
        // const matchUrls = matchLink(results) ?? [];

        // const urls = matchUrls.filter(url => /(tiktokcdn|rapidcdn)/gi.test(url));

        // return {
        //     music: {
        //         url: urls?.pop() as string,
        //     },
        //     video: {
        //         thumb: urls?.shift(),
        //         urls: urls as string[],
        //     },
        // };

        try {
            const json = JSON.parse(html);
            if (json.error) {
                return {
                    error: json.error,
                };
            }

            return {
                video: {
                    urls: [
                        json.hdDownloadUrl,
                        json.downloadUrl,
                    ],
                    title: json.postinfo.media_title,
                    duration: json.duration.toString(),
                },
                author: {
                    username: json.postinfo.unique_id,
                    id: json.postinfo.uid,
                    nick: json.postinfo.username,
                    thumb: json.postinfo.avatar_url,
                },
                sharesCount: json.stats.shareCount,
                playsCount: json.stats.playCount,
                commentsCount: json.stats.commentCount,
            }
        } catch {
            return {
                error: 'Video not found',
            }
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
