import {BaseProvider, ExtractedInfo} from './baseProvider';
import {getFetch} from '..';
import {handleException} from '../decorators';

/**
 * @class LoveTikProvider
 */
export class LoveTikProvider extends BaseProvider {
  /**
     * Get resource name
     *
     * @return {string}
     */
  public resourceName(): string {
    return 'lovetik';
  }

  public client = getFetch('https://lovetik.com');

    /**
     * @param {string} url
     */
    @handleException
  async fetch(url: string): Promise<ExtractedInfo> {
    const response = await this.client.post(
        './api/ajax/search', {
          'form': {
            'query': url,
          },
          'headers': {
            'Origin': 'https://lovetik.com/',
            'Referer': 'https://lovetik.com/',
          },
        },
    );

    return this.extract(response.body);
  }

    /**
     * @param {string} jsonString
     * @return {ExtractedInfo}
     */
    extract(jsonString: string): ExtractedInfo {
      const json = JSON.parse(jsonString);

      if (json.mess) {
        return {
          'error': json.mess,
        };
      }

      return {
        'music': {
          'url': json.links.pop().a,
        },
        'video': {
          'thumb': json.cover,
          'urls': json.links.map((l: Record<string, unknown>) => l.a),
        },
        'author': {
          'username': json.author.replace(/(<([^>]+)>)/ig, ''),
        },
      };
    }
}
