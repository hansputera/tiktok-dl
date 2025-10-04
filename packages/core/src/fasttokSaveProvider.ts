import {ZodObject} from 'zod';
import {getFetch} from '../fetch';
import {BaseProvider, ExtractedInfo, MaintenanceProvider} from './base';

/**
 * @class FasttokSaveProvider
 */
export class FasttokSaveProvider extends BaseProvider {
    /**
     * Get provider resource name
     * @return {string}
     */
    public resourceName(): string {
        return 'fasttoksave';
    }

    public client = getFetch('https://www.fasttoksave.com/');
    public maintenance?: MaintenanceProvider | undefined = undefined;

    /**
     * Fetch tiktok video resource
     * @param {string} url TikTok URL
     * @return {Promise<ExtractedInfo>}
     */
    async fetch(url: string): Promise<ExtractedInfo> {
        const response = await this.client
            .post('./en/wp-json/tiktok-downloader/v1/fetch', {
                json: {
                    url,
                },
            })
            .json<{
                code: number;
                msg: string;
                data?: {
                    author: {
                        nickname: string;
                        unique_id: string;
                    };
                    comment_count: number;
                    play_count: number;
                    cover: string;
                    play: string;
                    music_info: {
                        author: string;
                        cover: string;
                        title: string;
                    };
                    wmplay: string;
                    title: string;
                    duration: number;
                };
            }>();

        if (response.code === -1 || !response.data) {
            return {
                error: 'Video not found.',
            };
        }

        return {
            video: {
                urls: [response.data.play, response.data.wmplay],
                thumb: response.data.cover,
                duration: (response.data.duration * 1000).toString(),
            },
            music: {
                url: '',
                author: response.data.music_info.author,
                cover: response.data.music_info.cover,
                title: response.data.music_info.title,
            },
            commentsCount: response.data.comment_count,
            playsCount: response.data.play_count,
            caption: response.data.title,
        };
    }

    /**
     * Extract contents from HTML raw
     * @param {string} html HTML Raw
     * @return {{}}
     */
    public extract(html: string): ExtractedInfo | Promise<ExtractedInfo> {
        return {};
    }

    /**
     * Get params
     * @return {undefined}
     */
    public getParams(): ZodObject | undefined {
        return undefined;
    }
}
