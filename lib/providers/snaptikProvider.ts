import {snaptikFetch} from '..';
import {handleException} from '../decorators';
import {BaseProvider, ExtractedInfo} from './baseProvider';
import {deObfuscate, matchLink} from './util';

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


  /**
   * Extract information from raw html
   * @param {string} html - Raw HTML
   * @return {ExtractedInfo}
   */
  @handleException()
  extract(html: string): ExtractedInfo {
    const results = matchLink(deObfuscate(html));
    if (!results || !results.length) throw new Error('Broken');

    return {
      'error': undefined,
      'result': {
        'thumb': results?.shift(),
        'urls': [...new Set(results)],
      },
    };
  };
};
