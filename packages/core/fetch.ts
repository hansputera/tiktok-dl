import got, {ExtendOptions} from 'got';

export const getFetch = (baseUrl: string, options?: ExtendOptions) =>
    got.extend({
        prefixUrl: baseUrl,
        dnsCache: true,
        ...options,
    });
