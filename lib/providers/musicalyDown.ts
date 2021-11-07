import {musicalyFetch} from '..';
import {handleException} from '../decorators';
import {BaseProvider, ExtractedInfo} from './baseProvider';

/**
 * @class MusicalyDown
 */
export class MusicalyDown extends BaseProvider {
  /**
     *
     * @return {string}
     */
  public resourceName(): string {
    return 'musicalydown';
  }

  /**
     * @return {string}
     */
  public getURI(): string {
    return musicalyFetch.defaults.options.prefixUrl;
  }

    /**
     *
     * @param {string} url - Video Tiktok URL
     * @return {string}
     */
    @handleException()
  public async fetch(url: string): Promise<ExtractedInfo> {
    const headers = {
      'Accept': '*/*',
    };
    const res = await musicalyFetch('./', {
      headers,
    });
    const form = {} as Record<string, string>;
    const tokens = (res.body.match(/input name="([^"]+)/gi) as string[])
        .map((x) => x.split('"').pop() as string);
    const token = (
        res.body.match(/type="hidden" value="(.*?)"/gi) as string[])[0]
        .split(/=/g).pop()?.replace(/\"/g, '');
    const value = [url, token as string, '1'];
    // eslint-disable-next-line guard-for-in
    for (const tok in tokens) {
      form[tokens[tok]] = value[tok];
    }
    const cookie = res.headers['set-cookie']?.toString();
    const response = await musicalyFetch.post('./download', {
      form,
      headers: {
        cookie,
        ...headers,
      },
      method: 'POST',
    }).text();
    return this.extract(response);
  }

    /**
     *
     * @param {string} html - Raw HTML
     * @return {ExtractedInfo}
     */
    public extract(html: string): ExtractedInfo {
      const thumb = /img class="responsive-img" src="(.*?)"/gi.exec(html)?.[1];
      const matchUrls = (html
          .match(/<a.*?target="_blank".*?href="(.*?)".*?<\/a>/gi) as string[]);
      const urls = matchUrls.map((url) =>
      /<a.*?target="_blank".*?href="(.*?)".*?<\/a>/gi.exec(url)?.[1] as string);
      return {
        error: undefined,
        result: {
          urls,
          thumb,
        },
      };
    }
}
