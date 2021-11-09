import {getFetch} from '..';
import {handleException} from '../decorators';
import {BaseProvider, ExtractedInfo} from './baseProvider';
import {deObfuscateSaveFromScript} from './util';

/**
 * @class saveFromProvider
 */
export class SaveFromProvider extends BaseProvider {
  /**
     *
     * @return {string}
     */
  public resourceName(): string {
    return 'savefrom';
  }

  public client = getFetch('https://worker-as.sf-tools.com');

  /**
     *
     * @param {string} url - Video TikTok URL
     */
  @handleException
  public async fetch(url: string): Promise<ExtractedInfo> {
    const response = await this.client.post('./savefrom.php', {
      'form': {
        'sf_url': url,
        'sf_submit': '',
        'new': '2',
        'lang': 'id',
        'country': 'id',
        'os': 'Ubuntu',
        'browser': 'Firefox',
        'channel': 'Downloader',
        'sf-nomad': '1',
      },
      'headers': {
        'Origin': 'https://id.savefrom.net',
        'Referer': 'https://id.savefrom.net',
      },
    });

    return this.extract(response.body);
  }

  /**
     *
     * @param {string} html - HTML Raw
     * @return {ExtractedInfo}
     */
  @handleException
  extract(html: string): ExtractedInfo {
    const deobfuscated = deObfuscateSaveFromScript(html);
    const json = JSON.parse(
        (deobfuscated.match(/\({(.*)}\)/) as string[])[0]
            .replace(/(\(|\))/g, ''),
    );
    return {
      'error': undefined,
      'result': {
        'thumb': json.thumb,
        'advanced': {
          'videoId': json.id,
          'videoTitle': json.meta.title,
          'videoDuration': json.meta.duration,
          'urls': json.url.map((x:
            { type: string; subname: string; }, index: number) => ({
            'pos': index,
            'type': x.type,
            'resolution': x.subname,
          })),
        },
        'urls': json.url.map((x: { url: string; }) => x.url),
      },
    };
  }
}
