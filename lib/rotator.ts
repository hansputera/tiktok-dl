import {getRandomProvider} from '.';
import {providerCache} from '../config';
import {BaseProvider, ExtractedInfo} from './providers/baseProvider';
import {client} from './redis';

const redisClient = client;

export const rotateProvider = async (
    provider: BaseProvider, url: string,
    noCache: boolean = false):
    Promise<ExtractedInfo & { provider: string; }> => {
  const cachedData = await redisClient.get(url);
  // await redisClient.del(url);
  if (!cachedData) {
    const data = await provider.fetch(url);
    if (data.error) {
      // switching to other provider
      return await rotateProvider(getRandomProvider(), url);
    } else if (data.result && !data.result.urls.length) {
      return await rotateProvider(getRandomProvider(), url);
    } else {
      if (!noCache) {
        redisClient.set(url,
            JSON.stringify(
                {...data, provider: provider.resourceName()}), 'ex',
            providerCache);
      }
      return {...data, provider: provider.resourceName()};
    }
  } else {
    return JSON.parse(cachedData);
  }
};
