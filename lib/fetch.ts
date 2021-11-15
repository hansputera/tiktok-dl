import got, {ExtendOptions} from 'got';

export const fetch = got.extend({
  prefixUrl: 'https://www.tiktok.com',
  dnsCache: true,
});


export const getFetch = (baseUrl: string, options?: ExtendOptions) =>
  got.extend({
    prefixUrl: baseUrl,
    dnsCache: true,
    ...options,
  });

