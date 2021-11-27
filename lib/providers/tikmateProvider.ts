import {getFetch} from '..';
import {handleException} from '../decorators';
import {BaseProvider, ExtractedInfo} from './baseProvider';
import {deObfuscate, matchCustomDownload} from './util';

/**
 * @class TikmateProvider
 */
export class TikmateProvider extends BaseProvider {
  public client = getFetch('https://tikmate.online');
  /**
     *
     * @return {string}
     */
  public resourceName(): string {
    return 'tikmate';
  }

  /**
   *
   * @return {string}
   */
  public getURI(): string {
    return this.client.defaults.options.prefixUrl;
  }


  /**
   *
   * @param {string} url - Video TikTok URL
   */
  @handleException
  public async fetch(url: string): Promise<ExtractedInfo> {
    // we need to get the token

    const response = await this.client('./');
    const matchs = (
      response.body.match(/id="token" value="(.*)?"/) as string[]);

    const cookies = response.headers['cookie'];

    const abcResponse = await this.client.post('./abc.php', {
      form: matchs ? {
        'url': url,
        'token': matchs[1],
      } : {
        'url': url,
      },
      headers: {
        'Origin': this.client.defaults.options.prefixUrl,
        'Referer': this.client.defaults.options.prefixUrl + '/',
        'Cookie': cookies,
      },
    });

    return this.extract(abcResponse.body);
  }


  /**
   * Extract information from raw html
   * @param {string} html - Raw HTML
   * @return {ExtractedInfo}
   */
  @handleException
  extract(html: string): ExtractedInfo {
    const matchs = matchCustomDownload('tikmate', deObfuscate(html));
    return {
      'error': undefined,
      'result': {
        'thumb': matchs.shift(),
        'urls': matchs,
      },
    };
  }
};
