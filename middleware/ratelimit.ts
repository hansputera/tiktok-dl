import {VercelRequest} from '@vercel/node';
import {rateLimitConfig} from '../config';
import {client} from '../lib/redis';

export const ratelimitMiddleware = async (req: VercelRequest) => {
  const ip = req.headers['x-real-ip'];
  return await new Promise((resolve, reject) => {
    if (!rateLimitConfig.enable) return resolve(undefined);
    else if (!ip) {
      return reject(
          new Error('Can\'t find your real ip address!'));
    }
    client.get('rate-' + ip, (_, result) => {
      if (result) {
        if (parseInt(result) > rateLimitConfig.maxRatelimitPerXSeconds) {
          return reject(
              new Error('Please try again, you are getting ratelimit!'));
        }
        client.incr('rate-' + ip);
        return resolve(undefined);
      } else {
        client.set('rate-' + ip, '1', 'ex', rateLimitConfig.ratelimitTime);
        return resolve(undefined);
      }
    });
  });
};
