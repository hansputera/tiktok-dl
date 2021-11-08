import {getFetch} from '..';
import {BaseProvider, ExtractedInfo} from './baseProvider';
import {keyGeneratorTTSave} from './util';

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
  public async fetch(url: string): Promise<ExtractedInfo> {
    // getting token
    const response = await this.client('./');
    const token = (
          response.body.match(/doDownload\(id, '([^']+)'\)/) as string[]
    )[0].split('\'')[1];

    const dlResponse = await this.client.post('./download.php', {
      'json': {
        'id': url,
        'token': token,
        'key': keyGeneratorTTSave(token),
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
    console.log(html);
    return {
      'error': '',
    };
  }
};
