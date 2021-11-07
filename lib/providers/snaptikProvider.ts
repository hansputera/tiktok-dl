import {snaptikFetch} from '..';
import {handleException} from '../decorators';
import {BaseProvider, ExtractedInfo} from './baseProvider';
import {basicExtractor} from './util';

/**
 * @class SnaptikProvider
 */
export class SnaptikProvider extends BaseProvider {
  /**
     *
     * @return {string}
     */
  public resourceName(): string {
    return 'snaptik';
  }

  /**
   *
   * @return {string}
   */
  public getURI(): string {
    return snaptikFetch.defaults.options.prefixUrl;
  }

  /**
   *
   * @param {string} url - TikTok Video URL
   * @return {Promise<ExtractedInfo>}
   */
  @handleException()
  public async fetch(url: string): Promise<ExtractedInfo> {
    const response = await snaptikFetch('./abc.php', {
      searchParams: {
        'url': url,
      },
    });

    return this.extract(response.body);
  }

  public extract = basicExtractor;
};
