import {getFetch} from '..';
import {handleException} from '../decorators';
import {BaseProvider, ExtractedInfo} from './baseProvider';
import {matchLink} from './util';

/**
 * @class TTDownloader
 */
export class TTDownloader extends BaseProvider {
  /**
     * @return {string}
     */
  public resourceName(): string {
    return 'ttdownloader';
  }

  public client = getFetch('https://ttdownloader.com');

  /**
   *
   * @param {string} url - Video TikTok URL
   * @return {Promise<ExtractedInfo>}
   */
  @handleException
  public async fetch(url: string): Promise<ExtractedInfo> {
    // getting token and cookies
    const firstResponse = await this.client('./');
    const token = (firstResponse.body
        .match(/name="token" value="(.*)?"/) as string[])[1];
    const videoResponse = await this.client.post('./req', {
      form: {
        'token': token,
        'format': '',
        'url': url,
      },
      headers: {
        'Origin': 'https://ttdownloader.com',
        'Referer': 'https://ttdownloader.com',
        'Cookie': firstResponse.headers['set-cookie']?.toString(),
      },
    });

    return this.extract(videoResponse.body);
  }

  /**
   *
   * @param {string} html - HTML Raw
   * @return {ExtractedInfo}
   */
  extract(html: string): ExtractedInfo {
    const urls = matchLink(html);
    urls?.pop(); // remove 'https://snaptik.fans'
    return {
      'error': undefined,
      'result': {
        'thumb': undefined,
        'urls': urls as string[],
      },
    };
  }
};
