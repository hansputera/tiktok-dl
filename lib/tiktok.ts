import { fetch, TFetch } from '.';

import { ItemEnums, SearchFullResult, SearchPreviewTypeResult } from '../types';
import { tiktokBase } from './config';
import { Transformer } from './transformer';

class TikTok {
    async searchPreview(query: string) {
        const response = await fetch('./api/search/general/preview/' + this.buildParam(query));
        const d = JSON.parse(response.body) as SearchPreviewTypeResult;

        return {
            'q': encodeURIComponent(query),
            'data': d.sug_list.map(sug => ({
                'content': sug.content,
                'url': tiktokBase + '/search?q=' + encodeURIComponent(sug.word_record.words_content) + '&t=' + sug.word_record.group_id,
            })),
        }
    }

    async searchFull(query: string) {
        const response = await TFetch('./api/search/general/full/' + this.buildParam(query));
        const d = JSON.parse(response.body) as SearchFullResult;

        const userIndex = d.data.findIndex(x => x.user_list);
        if (userIndex >= 0) {
            d.data[userIndex].user_list?.forEach(uList => {
                (d.data as unknown[]).push({
                    type: ItemEnums.User,
                    ...Transformer.transformUser(uList),
                });
            });

            delete d.data[userIndex]; // remove user list item
        }

        return {
            'q': encodeURIComponent(query),
            'data': d.data.map(x => {
                if (x.item) return { ...Transformer.transformVideo(x.item), type: ItemEnums.Video };
                else return x;
            })
        }
    }

    private buildParam(q: string, region = 'ID'): string {
        return `?aid=${Math.floor(Math.random() * 5000)}&app_language=en&app_name=tiktok_web&browser_language=en-US&browser_name=Mozilla&browser_online=true&browser_platform=Linux x86_64&browser_version=5.0 (X11)&channel=tiktok_web&cookie_enabled=true&device_id=7015806844518483457&device_platform=web_pc&focus_state=true&from_page=search&history_len=5&is_fullscreen=false&is_page_visible=true&keyword=${encodeURIComponent(q)}&os=linux&priority_region=&referer=&region=${region.toUpperCase()}&screen_height=768&screen_width=1364&tz_name=Asia/Jakarta`;
    }
}

export const tiktok = new TikTok();