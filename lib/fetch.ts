import got from 'got';
import {tiktokBase, tiktokTBase} from './config';

export const TFetch = got.extend({
  prefixUrl: tiktokTBase,
  dnsCache: true,
});

export const fetch = got.extend({
  prefixUrl: tiktokBase,
  dnsCache: true,
});

export const snaptikFetch = got.extend({
  prefixUrl: 'https://snaptik.app/en',
  dnsCache: true,
});

export const tikmateFetch = got.extend({
  prefixUrl: 'https://tikmate.online',
  dnsCache: true,
});

export const musicalyFetch = got.extend({
  prefixUrl: 'https://musicaldown.com/id',
  dnsCache: true,
});