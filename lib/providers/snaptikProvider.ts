import {getFetch} from '..';
import {BaseProvider, ExtractedInfo} from './baseProvider';
import {deObfuscate, matchLink} from './util';

/**
 * @class SnaptikProvider
 */
export class SnaptikProvider extends BaseProvider {
  public client = getFetch('https://snaptik.app/en');
  /**
     *
     * @return {string}
     */
  public resourceName(): string {
    return 'snaptik';
  }

  public maintenance = undefined;

  /**
   *
   * @param {string} url - TikTok Video URL
   * @return {Promise<ExtractedInfo>}
   */
  public async fetch(url: string): Promise<ExtractedInfo> {
    const response = await this.client('./abc.php', {
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
  extract(html: string): ExtractedInfo {
    const results = matchLink(deObfuscate(html));
    if (!results || !results.length) throw new Error('Broken');

    return {
      'video': {
        'thumb': results?.shift(),
        'urls': [...new Set(results)],
      },
    };
  };
};
