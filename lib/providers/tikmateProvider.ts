import {tikmateFetch} from '..';
import {handleException} from '../decorators';
import {BaseProvider, ExtractedInfo} from './baseProvider';
import {deObfuscate, matchTikmateDownload} from './util';

/**
 * @class TikmateProvider
 */
export class TikmateProvider extends BaseProvider {
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
    return tikmateFetch.defaults.options.prefixUrl;
  }


  /**
   *
   * @param {string} url - Video TikTok URL
   */
  @handleException()
  public async fetch(url: string): Promise<ExtractedInfo> {
    // we need to get the token

    const response = await tikmateFetch('./');
    const token =
    (response.body.match(/id="token" value="(.*)?"/) as string[])[1];
    const cookies = response.headers['cookie'];

    const abcResponse = await tikmateFetch.post('./abc.php', {
      form: {
        'url': url,
        'token': token,
      },
      headers: {
        'Origin': tikmateFetch.defaults.options.prefixUrl,
        'Referer': tikmateFetch.defaults.options.prefixUrl + '/',
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
  extract(html: string): ExtractedInfo {
    const matchs = matchTikmateDownload(deObfuscate(html));
    return {
      'error': undefined,
      'result': {
        'thumb': matchs.shift(),
        'urls': matchs,
      },
    };
  }
};
