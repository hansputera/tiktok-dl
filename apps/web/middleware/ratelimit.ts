import type { NextApiRequest, NextApiResponse } from 'next';
import {rateLimitConfig} from '../config';
import {client} from '../lib';

export const ratelimitMiddleware = async (req: NextApiRequest, res: NextApiResponse) => {
  const ip = req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for'];
  if (!rateLimitConfig.enable || process.env.NODE_ENV === 'development') return true;
    else if (!ip) {
      return res.status(401).json({ 'message': 'Couldn\'t find your real ip address.' });
    }
    client.get('rate-' + ip, (_, result) => {
      if (result) {
        if (parseInt(result) > rateLimitConfig.maxRatelimitPerXSeconds) {
          return res.status(429).json({
		  'message': 'Please try again, you are getting ratelimit!'
	  });
	};
        client.incr('rate-' + ip);
        return true;
      } else {
        client.set('rate-' + ip, '1', 'ex', rateLimitConfig.ratelimitTime);
        return true;
      }
    });
};
