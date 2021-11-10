import got, {ExtendOptions} from 'got';
import {tiktokBase, tiktokTBase} from './config';

export const TFetch = got.extend({
  prefixUrl: tiktokTBase,
  dnsCache: true,
});

export const fetch = got.extend({
  prefixUrl: tiktokBase,
  dnsCache: true,
});


export const getFetch = (baseUrl: string, options?: ExtendOptions) =>
  got.extend({
    prefixUrl: baseUrl,
    dnsCache: true,
    ...options,
  });

export const gimmeProxyFetch = got.extend({
  prefixUrl: 'https://gimmeproxy.com',
  dnsCache: true,
});
