import {getRandomProvider} from '.';
import {BaseProvider, ExtractedInfo} from './providers/baseProvider';
import {client} from './redis';

const redisClient = client;

export const rotateProvider = async (
    provider: BaseProvider, url: string):
    Promise<ExtractedInfo & { provider: string; }> => {
  const cachedData = await redisClient.get(url);
  if (!cachedData) {
    const data = await provider.fetch(url);
    if (data.error) {
      // switching to other provider
      return await rotateProvider(getRandomProvider(), url);
    } else {
      redisClient.set(url,
          JSON.stringify(
              {...data, provider: provider.resourceName()}), 'ex', 30);
      redisClient.disconnect(false);
      return {...data, provider: provider.resourceName()};
    }
  } else {
    redisClient.disconnect(false);
    return JSON.parse(cachedData);
  }
};
