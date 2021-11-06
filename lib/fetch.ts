import got from 'got';
import { tiktokBase, tiktokTBase } from './config';

export const TFetch = got.extend({
    prefixUrl: tiktokTBase,
    dnsCache: true,
});

export const fetch = got.extend({
    prefixUrl: tiktokBase,
    dnsCache: true,
});

export const Got = got;