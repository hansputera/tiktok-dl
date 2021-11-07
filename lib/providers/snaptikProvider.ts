import {snaptikFetch} from '..';
import {handleException} from '../decorators/handleException';
import {BaseProvider, ExtractedInfo} from './baseProvider';

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
  extract(html: string): ExtractedInfo {
    if (/error/gi.test(html)) {
      return {
        'error': html.split('\'')
            .find((x) => /(((url)? error)|could)/gi.test(x)),
      };
    } else {
      // only match script tag
      const obfuscatedScripts = html
          .match(/<script[\s\S]*?>[\s\S]*?<\/script>/gi);
      if (!obfuscatedScripts?.length) {
        return {
          error: 'Cannot download the video!',
        };
      } else {
        // eslint-disable-next-line max-len
        const results = eval(obfuscatedScripts[0].replace(/<(\/)?script( type=".+")?>/g, '').trim().replace('eval', '')).match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);
        return {
          'error': undefined,
          'result': {
            'thumb': results.shift(),
            'urls': [...new Set(results)] as string[],
          },
        };
      }
    }
  }
};
