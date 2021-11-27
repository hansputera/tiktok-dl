import {BaseProvider, ExtractedInfo} from './baseProvider';
import {getFetch} from '..';
import {handleException} from '../decorators';
import {matchCustomDownload} from './util';

/**
 * @class SaveTikProvider
 */
export class SaveTikProvider extends BaseProvider {
  /**
     * Get resource name
     *
     * @return {string}
     */
  public resourceName(): string {
    return 'savetik';
  }

  public client = getFetch('https://savetik.net');

    /**
     * @param {string} url
     *
     * @return {Promise<ExtractedInfo>}
     */
    @handleException
  async fetch(url: string): Promise<ExtractedInfo> {
    const response = await this.client('./');

    const token = (
            response.body.match(/id="token" value="([^""]+)"/) as string[]
    )[1];

    const responseAction = await this.client.post(
        './action.php', {
          'form': {
            'url': url,
            'token': token,
          },
          'headers': {
            'cookie': response.headers['set-cookie']?.toString(),
            'Referer': 'https://savetik.net/',
            'Origin': 'https://savetik.net',
          },
        },
    );

    if (JSON.parse(responseAction.body).error) {
      return {
        'error': JSON.parse(responseAction.body).message,
      };
    };

    return this.extract(JSON.parse(responseAction.body).data);
  }

    /**
   * @param {string} html
   * @return {ExtractedInfo}
   */
    extract(html: string): ExtractedInfo {
      const urls = matchCustomDownload('savetik', html);

      return {
        'result': {
          'thumb': urls?.shift(),
          'advanced': {
            'musicUrl': urls?.pop(),
          },
          'urls': urls as string[],
        },
      };
    }
}
