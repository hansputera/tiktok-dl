import {BaseProvider, ExtractedInfo} from './baseProvider';
import {getFetch} from '..';
import {matchLink} from './util';

/**
 * @class TikDownProvider
 */
export class TikDownProvider extends BaseProvider {
  /**
     * Get resource name.
     *
     * @return {string}
     */
  public resourceName(): string {
    return 'tikdown';
  }

  public client = getFetch('https://tikdown.org');

  /**
     * @param {string} url
     *
     * @return {Promise<ExtractedInfo>}
     */
  async fetch(url: string): Promise<ExtractedInfo> {
    const response = await this.client('./');

    const token = (
            response.body.match(
                /name="_token" value="([^""]+)"/) as string[]
    )[1];

    const responseAjax = await this.client.post(
        './getAjax', {
          'form': {
            'url': url,
            '_token': token,
          },
          'headers': {
            'x-csrf-token': token,
            'cookie': response.headers['set-cookie']?.toString(),
          },
        },
    );

    return this.extract(responseAjax.body);
  }

  /**
     * @param {string} html
     * @return {ExtractedInfo}
     */
  extract(html: string): ExtractedInfo {
    const urls = matchLink(html) as string[];

    return {
      'result': {
        'urls': urls,
      },
    };
  }
}
