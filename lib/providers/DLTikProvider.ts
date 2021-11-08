import {getFetch} from '..';
import {BaseProvider, ExtractedInfo} from './baseProvider';

/**
 * @class DLTikProvider
 */
export class DLTikProvider extends BaseProvider {
  /**
     * @return {string}
     */
  public resourceName(): string {
    return 'dltik';
  }

  public client = getFetch('https://dltik.com');

  /**
   *
   * @param {string} url - Video TikTok URL
   */
  public async fetch(url: string): Promise<ExtractedInfo> {
    // getting verification token
    const response = await this.client('./');
    const token = (
        response.body.match(/type="hidden" value="([^""]+)"/) as string[]
    )[1];

    const dlResponse = await this.client.post('./', {
      'form': {
        'm': 'getlink',
        'url': url,
        '__RequestVerificationToken': token,
      },
      'headers': {
        'Origin': this.client.defaults.options.prefixUrl,
        'Referer': this.client.defaults.options.prefixUrl,
        'Cookie': response.headers['set-cookie']?.toString(),
      },
    });

    return this.extract(dlResponse.body);
  }

  /**
   *
   * @param {string} html - Raw
   * @return {ExtractedInfo}
   */
  extract(html: string): ExtractedInfo {
    const json = JSON.parse(html);
    if (!json.status) {
      return {
        'error': json.message,
      };
    } else {
      return {
        'error': undefined,
        'result': {
          'thumb': json.data.dynamicCover,
          'urls': [json.data.destinationUrl, json.data.watermarkVideoUrl],
          'advanced': {
            'musicUrl': json.data.musicUrl,
            'videoId': json.data.videoId,
            'authorUsername': json.data.authorId,
            'authorNickname': json.data.authorNickname,
            'description': json.data.desc,
          },
        },
      };
    }
  }
};
