import {fetch, TFetch as tFetch, tiktokBase, Transformer} from '.';

import {
  ItemEnums, SearchFullResult,
  SearchPreviewTypeResult, UserResult,
  VideoItemResult,
} from '../types';

interface ResultData {
    q: string;
    data: {
        content: string;
        url: string;
    }[] | {
        type: number;
        user_list?: UserResult[];
        item?: VideoItemResult;
    }[];
}
/**
 * @class TikTok
 */
class TikTok {
  /**
     *
     * @param {string} query - Keyword
     * @return {Promise<ResultData>}
     */
  async searchPreview(query: string): Promise<ResultData> {
    const response = await fetch('./api/search/general/preview/' +
    this.buildParam(query), {
      'headers': {
        'Cookie': 'sessionid=' + process.env.SESSION,
      },
    });
    const d = JSON.parse(response.body) as SearchPreviewTypeResult;

    return {
      'q': encodeURIComponent(query),
      'data': d.sug_list.map((sug) => ({
        'content': sug.content,
        'url': tiktokBase + '/search?q=' +
        encodeURIComponent(sug.word_record.words_content) +
         '&t=' + sug.word_record.group_id,
      })),
    };
  }

  /**
   *
   * @param {string} query - Keyword
   * @return {Promise<ResultData>}
   */
  async searchFull(query: string) {
    const response = await tFetch('./api/search/general/full/' +
     this.buildParam(query), {
      'headers': {
        'Cookie': 'sessionid=' + process.env.SESSION,
      },
    });
    const d = JSON.parse(response.body) as SearchFullResult;
    if (!d.data) throw new Error('Ratelimited tiktok or invalid session');

    const userIndex = d.data.findIndex((x) => x.user_list);
    if (userIndex >= 0) {
      (d.data[userIndex] as unknown) = {
        card: 'users',
        data: d.data[userIndex].user_list?.map((u) =>
          ({type: ItemEnums.User, ...Transformer.transformUser(u)})),
      };
    }

    return {
      'q': encodeURIComponent(query),
      'data': d.data.map((x) => {
        if (x.item) {
          return {
            ...Transformer.transformVideo(x.item),
            type: ItemEnums.Video,
          };
        } else {
          return x;
        }
      }),
    };
  }

  /**
   *
   * @param {string} q - Keyword
   * @param {string} region - Region
   * @return {string}
   */
  private buildParam(q: string, region: string = 'ID'): string {
    // eslint-disable-next-line max-len
    return `?aid=1988&app_language=en&app_name=tiktok_web&battery_info=1&browser_language=en-US&browser_name=Mozilla&browser_online=true&browser_platform=Linux%20x86_64&browser_version=5.0%20%28X11%3B%20Linux%20x86_64%29%20AppleWebKit%2F537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome%2F94.0.4606.71%20Safari%2F537.36&channel=tiktok_web&cookie_enabled=true&device_id=7027325519520253442&device_platform=web_pc&focus_state=true&from_page=search&history_len=4&is_fullscreen=false&is_page_visible=true&keyword=${encodeURIComponent(q)}&offset=0&os=linux&priority_region=&referer=https%3A%2F%2Fwww.tiktok.com%2F&region=${region}&root_referer=https%3A%2F%2Fwww.tiktok.com%2F&screen_height=768&screen_width=1364&tz_name=Asia%2FJakarta&verifyFp=verify_d6e5614446bdc1c596e499a4900879f2&msToken=&X-Bogus=DFSzswVL0JiAN9l0SNBf-ryECY7I&_signature=_02B4Z6wo000016Gb.WQAAIDAI2u1tUBg2Muhm.nAAInpbc`;
  }

  /**
   *
   * @return {boolean}
   */
  public isReady(): boolean {
    return !!process.env.SESSION;
  }
}

export const tiktok = new TikTok();
