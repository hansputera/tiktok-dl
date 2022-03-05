import {getFetch} from '../fetch';
import {BaseProvider, ExtractedInfo} from './base';

/**
 * @class MusicalyDown
 */
export class MusicalyDown extends BaseProvider {
  public client = getFetch('https://musicaldown.com/id');
  /**
     *
     * @return {string}
     */
  public resourceName(): string {
    return 'musicalydown';
  }

  public maintenance = undefined;

  /**
     *
     * @param {string} url - Video Tiktok URL
     * @return {Promise<ExtractedInfo>}
     */
  public async fetch(url: string): Promise<ExtractedInfo> {
    const res = await this.client('./', {
      headers: {
        Accept: '*/*',
        Referer: this.client.defaults.options.prefixUrl,
        Origin: this.client.defaults.options.prefixUrl,
      },
    });
    const tokens = res.body.match(
        /input name="([^""]+)" type="hidden" value="([^""]+)"/,
    ) as string[];
    const response = await this.client.post('./download', {
      form: {
        [(res.body.match(/input name="([^"]+)/) as string[])[1]]: url,
        [tokens[1]]: tokens[2],
        verify: 1,
      },
      headers: {
        Cookie: res.headers['set-cookie']?.toString(),
        Accept: '*/*',
        Referer: this.client.defaults.options.prefixUrl,
        Origin: this.client.defaults.options.prefixUrl,
      },
    });

    return this.extract(response.body);
  }

  /**
     *
     * @param {string} html - Raw HTML
     * @return {ExtractedInfo}
     */
  public extract(html: string): ExtractedInfo {
    const matchUrls = html.match(
        /<a.*?target="_blank".*?href="(.*?)".*?<\/a>/gi,
    ) as string[];
    const urls = matchUrls.map(
        (url) =>
                /<a.*?target="_blank".*?href="(.*?)".*?<\/a>/gi.exec(
                    url,
                )?.[1] as string,
    );
    return {
      video: {
        urls: urls,
        thumb: /img class="responsive-img" src="(.*?)"/gi.exec(
            html,
        )?.[1],
      },
    };
  }
}
