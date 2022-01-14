import type {VercelRequest, VercelResponse} from '@vercel/node';
import {Providers} from '../lib';
import {ratelimitMiddleware} from '../middleware/ratelimit';

export default async (_: VercelRequest, res: VercelResponse) => {
  await ratelimitMiddleware(_);
  const providers = Providers.map((p) => ({
    'name': p.resourceName(),
    'url': p.client.defaults.options.prefixUrl,
    'maintenance': p.maintenance,
  }));

  return res.send(providers);
};
