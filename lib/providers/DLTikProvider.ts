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

  public maintenance = {
    'reason': 'My prediction is that DLTik needs an active session to use.',
  };

  /**
   * @param {string} url - Video TikTok URL
   * @return {Promise<ExtractedInfo>}
   */
  public async fetch(url: string): Promise<ExtractedInfo> {
    // getting verification token
    const response = await this.client('./#url=' +
        encodeURIComponent(url));
    const token = (
        response.body.match(/type="hidden" value="([^""]+)"/) as string[]
    )[1];

    const dlResponse = await this.client.post('./', {
      'form': {
        'm': 'getlink',
        'url': `https://m.tiktok.com/v/${
          (/predownload\('([0-9]+)'\)/gi.exec(response.body) as string[])[1]
        }.html`,
        '__RequestVerificationToken': token,
      },
      'headers': {
        'Origin': this.client.defaults.options.prefixUrl,
        'Referer': response.url,
        'Cookie': response.headers['set-cookie']?.toString(),
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-requested-with': 'XMLHttpRequest',
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
    //   if (json.data.videoId === '7013188037203070234') {
    //     return {
    //       'error': 'Invalid url',
    //     };
    //   }
      return {
        'video': {
          'id': json.data.videoId,
          'urls': [json.data.watermarkVideoUrl, json.data.destinationUrl],
          'thumb': json.data.dynamicCover,
        },
        'music': {
          'url': json.data.musicUrl,
        },
        'caption': json.data.desc,
      };
    }
  }
};
