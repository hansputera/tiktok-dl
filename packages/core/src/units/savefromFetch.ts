import {ExtractedInfo} from '../base';
import {request} from '../http';
import {savefromExtract} from './savefromParse';

const BASE = 'https://worker.savefrom.net';
const UA =
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

export async function savefromFetch(url: string): Promise<ExtractedInfo> {
    const responseFirst = await request({
        base: 'https://en1.savefrom.net',
        path: './',
    });
    const response = await request({
        base: BASE,
        path: './savefrom.php',
        form: {
            sf_url: url,
            sf_submit: '',
            new: '2',
            lang: 'en',
            country: 'id',
            os: 'Linux',
            browser: 'Brave',
            channel: 'main',
            'sf-nomad': '1',
            url,
            ts: Date.now(),
            _ts: Date.now(),
            _tsc: 0,
        },
        headers: {
            Origin: 'https://en1.savefrom.net',
            Referer: 'https://en1.savefrom.net',
            'User-Agent': UA,
            Cookies: responseFirst.headers['set-cookie']?.toString(),
        },
    });

    return savefromExtract(response.body);
}
