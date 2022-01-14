import {VercelRequest, VercelResponse} from '@vercel/node';
import {matchLink} from '../lib/providers/util';
import {client} from '../lib/redis';
import {ratelimitMiddleware} from '../middleware/ratelimit';

export default async (_: VercelRequest, res: VercelResponse) => {
  await ratelimitMiddleware(_);
  const keys = await client.keys('*');

  res.status(200).json(keys.filter((x) => matchLink(x)));
};
