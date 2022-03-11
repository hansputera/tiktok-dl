import {providerCache} from '../config';
import {BaseProvider, ExtractedInfo, getRandomProvider} from 'tiktok-dl-core';
import {client as redisClient} from './redis';

/**
 * Rotate provider.
 * @param {BaseProvider} provider Provider instance
 * @param {string} url Video TikTok URL
 * @param {boolean?} skipOnError Rotate when error
 * @return {Promise<ExtractedInfo>}
 */
export const rotateProvider = async (
    provider: BaseProvider,
    url: string,
    skipOnError: boolean = true,
): Promise<ExtractedInfo & {provider: string}> => {
    if (process.env.NODE_ENV === 'development') {
        await redisClient.del(url);
    }
    //   console.log(provider.resourceName());
    if (provider.maintenance) {
        return await rotateProvider(getRandomProvider(), url, skipOnError);
    }
    const cachedData = await redisClient.get(url);
    if (!cachedData) {
        try {
            const data = await provider.fetch(url);
            if (data.error) {
                // switching to other provider
                return await rotateProvider(getRandomProvider(), url);
            } else if (data.video && !data.video.urls.length) {
                return await rotateProvider(getRandomProvider(), url);
            } else {
                redisClient.set(
                    url,
                    JSON.stringify({
                        ...data,
                        provider: provider.resourceName(),
                    }),
                    'ex',
                    providerCache,
                );
                return {...data, provider: provider.resourceName()};
            }
        } catch (e) {
            if (skipOnError) {
                return await rotateProvider(getRandomProvider(), url);
            } else {
                return {
                    error: (e as Error).message,
                    provider: provider.resourceName(),
                };
            }
        }
    } else {
        return JSON.parse(cachedData);
    }
};
