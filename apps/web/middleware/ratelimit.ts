import type {NextApiRequest, NextApiResponse} from 'next';
import {rateLimitConfig} from '../config';
import {HttpError} from '../errors';
import {client} from '../lib';

export const ratelimitMiddleware = async (
    req: NextApiRequest,
    _res: NextApiResponse,
) => {
    const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'];
    if (!rateLimitConfig.enable || process.env.NODE_ENV === 'development')
        return undefined;
    else if (!ip)
        throw new HttpError("Couldn't find your real ip address!").setCode(401);
    const result = await client.get('rate-'.concat(ip.toString()));
    if (result) {
        if (parseInt(result) > rateLimitConfig.maxRatelimitPerXSeconds) {
            throw new HttpError(
                'Please try again, you are getting ratelimit!',
            ).setCode(429);
        }
        client.incr('rate-'.concat(ip.toString()));
        return undefined;
    } else {
        client.set(
            'rate-'.concat(ip.toString()),
            '1',
            'EX',
            rateLimitConfig.ratelimitTime,
        );
        return undefined;
    }
};
