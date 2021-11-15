import {VercelRequest, VercelResponse} from '@vercel/node';
import {matchLink} from '../lib/providers/util';
import {client} from '../lib/redis';

export default async (_: VercelRequest, res: VercelResponse) => {
  const keys = await client.keys('*');

  res.status(200).json(keys.filter((x) => matchLink(x)));
};
