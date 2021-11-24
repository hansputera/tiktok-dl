import {getFetch} from '..';
import {handleException} from '../decorators';
import {BaseProvider, ExtractedInfo} from './baseProvider';
import {keyGeneratorTTSave, matchLink} from './util';

/**
 * @class TTSave
 */
export class TTSave extends BaseProvider {
  /**
     * @return {string}
     */
  public resourceName(): string {
    return 'ttsave';
  }

  public client = getFetch('https://ttsave.app');

  /**
   *
   * @param {string} url - TikTok Video URL
   * @return {Promise<ExtractedInfo>}
   */
  @handleException
  public async fetch(url: string): Promise<ExtractedInfo> {
    // getting token
    const response = await this.client('./');
    const token = (
          response.body.match(/m\(e,(.)?"(.*)"\)/) as string[]
    ).filter((x) => x)[1].split(/"\)}/)[0];

    const dlResponse = await this.client.post('./download.php', {
      'json': {
        'id': url,
        'token': token,
        'key': await keyGeneratorTTSave(token),
      },
      'headers': {
        'Origin': this.client.defaults.options.prefixUrl,
        'Referer': this.client.defaults.options.prefixUrl,
        'Cookie': response.headers['set-cookie']?.toString(),
      },
    });

    return this.extract(dlResponse.body);
  }

  /**
   *
   * @param {string} html - HTML Raw
   * @return {ExtractedInfo}
   */
  extract(html: string): ExtractedInfo {
    const tiktokCDNs = (matchLink(html) as string[]).filter(
        (x) => /http(s)?:\/\/(.*)?.tiktokcdn.com/gi.test(x),
    );
    const videoCDNs = tiktokCDNs.filter((x) => !/jpeg/gi.test(x));

    return {
      'error': undefined,
      'result': {
        'thumb': tiktokCDNs.find((x) => /jpeg/gi.test(x)),
        'urls': videoCDNs.filter((x) => !/music/gi.test(x)),
        'advanced': {
          'musicUrl': videoCDNs.find((x) => /music/gi.test(x)),
        },
      },
    };
  }
};
