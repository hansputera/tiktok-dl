import {BaseProvider, ExtractedInfo} from './baseProvider';
import {getFetch} from '..';
import {handleException} from '../decorators';
import {matchLink} from './util';

/**
 * @class FireTikProvider
 */
export class FireTikProvider extends BaseProvider {
  /**
     * Get resource name
     *
     * @return {string}
     */
  public resourceName(): string {
    return 'firetik';
  }

  public client = getFetch('https://firetik.com');

    /**
     * @param {string} url
     * @return {Promise<ExtractedInfo>}
     */
    @handleException
  async fetch(url: string): Promise<ExtractedInfo> {
    const response = await this.client.post('./down.php', {
      'form': {
        'url': url,
      },
    });

    return this.extract(response.body);
  }

    /**
     * @param {string} html
     * @return {ExtractedInfo}
     */
    extract(html: string): ExtractedInfo {
      const urls = matchLink(html) as string[];
      urls.pop();

      const t = urls[1];
      return {
        'result': {
          'urls': urls.filter((u) => u !== t),
          'thumb': t,
        },
      };
    }
}
