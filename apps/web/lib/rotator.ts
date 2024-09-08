import {maxRotateCount, providerCache} from '../config';
import {BaseProvider, ExtractedInfo, getRandomProvider} from 'tiktok-dl-core';
import {client as redisClient} from './redis';

/**
 * Rotate provider.
 * @param {BaseProvider} provider Provider instance
 * @param {string} url Video TikTok URL
 * @param {boolean?} skipOnError Rotate when error
 * @param {Record<string,string>} params Advanced provider fetch options
 * @param {number} retryCount Retry count.
 * @return {Promise<ExtractedInfo>}
 */
export const rotateProvider = async (
    provider: BaseProvider,
    url: string,
    skipOnError: boolean = true,
    params?: Record<string, string>,
    retryCount: number = 0,
): Promise<ExtractedInfo & {provider: string}> => {
    if (retryCount >= maxRotateCount) {
        return {
            error: 'MAX_ROTATE_ALLOWED',
            provider: retryCount.toString().concat(' providers'),
        };
    }
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
            const data = await provider.fetch(url, params ?? {});
            if (data.error) {
                if (!skipOnError) {
                    return {
                        error: data.error,
                        provider: provider.resourceName(),
                    };
                }
                retryCount++;
                // switching to other provider
                return await rotateProvider(
                    getRandomProvider(),
                    url,
                    skipOnError,
                    params,
                    retryCount,
                );
            } else if (data.video && !data.video.urls.length) {
                retryCount++;
                return await rotateProvider(
                    getRandomProvider(),
                    url,
                    skipOnError,
                    params,
                    retryCount,
                );
            } else {
                redisClient.set(
                    url,
                    JSON.stringify({
                        ...data,
                        provider: provider.resourceName(),
                    }),
                    'EX',
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
