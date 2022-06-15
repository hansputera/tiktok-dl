import {BaseProvider, ExtractedInfo} from './base';
import {getFetch} from '../fetch';
import type {Shape} from 'ow/dist';

/**
 * @class DownloadOne
 */
export class DownloadOne extends BaseProvider {
    /**
     * Get provider name
     * @return {string}
     */
    public resourceName(): string {
        return 'ttdownloaderone';
    }

    public client = getFetch('http://tiktokdownloader.one');

    public maintenance = undefined;

    /**
     * Fetch ttdownloader.one
     * @param {string} url Video TikTok URL
     * @return {Promise<ExtractedInfo>}
     */
    public async fetch(url: string): Promise<ExtractedInfo> {
        // getting the token
        const response = await this.client('./');

        const token = (
            /name="_token_" content="(.*)"/gi.exec(response.body) as string[]
        )[1];

        const dlResponse = await this.client('./api/v1/fetch?url=' + url, {
            headers: {
                TOKEN: token,
                Referer: 'http://tiktokdownloader.one/',
                Origin: 'http://tiktokdownloader.one',
                Accept: 'application/json, text/plain, */*',
            },
        });

        if (dlResponse.statusCode !== 200) {
            return {
                error: "Probably the video doesn't exist",
            };
        }

        return this.extract(dlResponse.body);
    }

    /**
     * Extract page from ttdownloader.one site
     * @param {string} html
     * @return {ExtractedInfo}
     */
    extract(html: string): ExtractedInfo {
        const json = JSON.parse(html);
        if (json.error) {
            return {
                error: json.error,
            };
        }

        return {
            video: {
                urls: [json.url, json.url_nwm],
                thumb: json.cover,
                id: json.video_id,
            },
            music: {
                url: json.music.url,
                title: json.music.title,
                cover: json.music.cover,
                author: json.music.author,
            },
            author: {
                id: json.user.name,
                username: json.user.username,
                thumb: json.user.cover,
            },
            caption: json.caption,
            updatedAt: json.updatedAt ?? '-',
            uploadedAt: json.uploaded_at,
            commentsCount: json.stats.comment,
            sharesCount: json.stats.shares,
            likesCount: json.stats.likes,
            playsCount: json.stats.play,
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
