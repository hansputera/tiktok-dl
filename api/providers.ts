import type {VercelRequest, VercelResponse} from '@vercel/node';
import {Providers} from '../lib';

export default async (_: VercelRequest, res: VercelResponse) => {
  const providers = Providers.map((p) => ({
    'name': p.resourceName(),
    'url': p.client.defaults.options.prefixUrl,
    'maintenance': p.maintenance,
  }));

  return res.send(providers);
};
