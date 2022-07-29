import type {NextApiRequest, NextApiResponse} from 'next';
import {rateLimitConfig} from '../config';
import {client} from '../lib';

export const ratelimitMiddleware = async (
    req: NextApiRequest,
    res: NextApiResponse,
) => {
    const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'];
    if (!rateLimitConfig.enable || process.env.NODE_ENV === 'development')
        return true;
    else if (!ip) {
        return res
            .status(401)
            .json({message: "Couldn't find your real ip address."});
    }
    const result = await client.get('rate-'.concat(ip.toString()));
    if (result) {
        if (parseInt(result) > rateLimitConfig.maxRatelimitPerXSeconds) {
            return res.status(429).json({
                message: 'Please try again, you are getting ratelimit!',
            });
        }
        client.incr('rate-'.concat(ip.toString()));
        return true;
    } else {
        client.set(
            'rate-'.concat(ip.toString()),
            '1',
            'EX',
            rateLimitConfig.ratelimitTime,
        );
        return true;
    }
};
