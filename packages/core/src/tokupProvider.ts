import {BaseProvider, ExtractedInfo} from './base';
import {getFetch} from '../fetch';

/**
 * @class TokupProvider
 */
export class TokupProvider extends BaseProvider {
  /**
     * Get provider name
     * @return {string}
     */
  public resourceName(): string {
    return 'tokup';
  }

  public client = getFetch('https://tokup.app');

  public maintenance = {
    reason: 'Tokup site returned \'Oops! Something went wrong!\'',
  };

  /**
     * Fetch tokup
     * @param {string} url - TikTok Video URL
     * @return {Promise<ExtractedInfo>}
     */
  public async fetch(url: string): Promise<ExtractedInfo> {
    const response = await this.client.post('./', {
      form: {
        url: url,
      },
      headers: {
        Origin: this.client.defaults.options.prefixUrl,
        Referer: this.client.defaults.options.prefixUrl,
      },
      timeout: 3000,
    });

    if (
      response.statusCode !== 200 ||
            /video not found\b/gi.test(response.body)
    ) {
      return {
        error: 'Video Not Found',
      };
    } else if (/oops/gi.test(response.body)) {
      return {
        error: 'Tokup Error',
      };
    } else {
      return this.extract(response.body);
    }
  }

  /**
     * Extract tokup html elements
     * @param {string} html
     * @return {ExtractedInfo}
     */
  extract(html: string): ExtractedInfo {
    console.log(html);
    const authorProfile = (
            /http(s)?(:\/\/(.*)\.tiktokcdn\.com\/(.*))/gi.exec(html) as string[]
    )[0];
    const nums = (html.match(/<td>[0-9]+<\/td>/g) as string[]).map((n) =>
      n.replace(/<(\/)?[a-zA-Z0-9]+>/gi, ''),
    );
    const url = [
      ...new Set(
                html.match(
                    // eslint-disable-next-line max-len
                    /http(s)?(:\/\/tikmate\.app\/download\/[A-Za-z0-9\-\_]+\/[0-9]+\.mp4+)/gi,
                ) as string[],
      ),
    ][0];

    return {
      video: {
        urls: [url, url + '?hd=1'],
      },
      author: {
        username: (/target="_blank"\>(.*)\</.exec(html) as string[])[1],
        thumb: authorProfile.substring(0, authorProfile.length - 1),
      },
      uploadedAt: (html.match(/<p>(.+)<\/p>/) as string[])[1],
      likesCount: nums[0] as unknown as number,
      commentsCount: nums[1] as unknown as number,
      sharesCount: nums[2] as unknown as number,
    };
  }
}
