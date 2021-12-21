import {BaseProvider, ExtractedInfo} from './baseProvider';
import {getFetch} from '../fetch';
import {handleException} from '../decorators';

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

  /**
     * Fetch ttdownloader.one
     * @param {string} url Video TikTok URL
     * @return {Promise<ExtractedInfo>}
     */
  @handleException
  public async fetch(
      url: string,
  ): Promise<ExtractedInfo> {
    // getting the token
    const response = await this.client('./');

    const token = (/name="_token_" content="(.*)"/gi
        .exec(response.body) as string[])[1];

    const dlResponse = await this.client(
        './api/v1/fetch?url=' + url, {
          'headers': {
            'TOKEN': token,
            'Referer': 'http://tiktokdownloader.one/',
            'Origin': 'http://tiktokdownloader.one',
            'Accept': 'application/json, text/plain, */*',
          },
        },
    );

    if (dlResponse.statusCode !== 200) {
      return {
        'error': 'Probably the video doesn\'t exist',
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

    return {
      'result': {
        'urls': [
          json.url,
          json.url_nwm,
        ],
        'thumb': json.cover,
        'advanced': {
          'videoId': json.video_id,
          'musicUrl': json.music.url,
          'musicTitle': json.music.title,
          'musicAuthor': json.music.author,
          'musicCover': json.music.cover,
          'author': json.user.username,
          'authorId': json.user.name,
          'authorThumb': json.user.cover,
          'uploadedAt': json.uploaded_at,
          'updatedAt': json.updated_at ?? '-',
          'caption': json.caption,
          'commentsCount': json.stats.comment,
          'sharesCount': json.stats.shares,
          'likesCount': json.stats.like,
          'playsCount': json.stats.play,
        },
      },
    };
  }
}
