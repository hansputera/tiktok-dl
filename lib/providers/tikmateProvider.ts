import {tikmateFetch} from '..';
import {handleException} from '../decorators';
import {BaseProvider, ExtractedInfo} from './baseProvider';
import {basicExtractor} from './util';

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

    const abcResponse = await tikmateFetch('./abc.php', {
      form: {
        'url': url,
        'token': token,
      },
      headers: {
        'Origin': tikmateFetch.defaults.options.prefixUrl,
        'Referer': tikmateFetch.defaults.options.prefixUrl + '/',
      },
    });

    return this.extract(abcResponse.body);
  }

  public extract = basicExtractor;
};
