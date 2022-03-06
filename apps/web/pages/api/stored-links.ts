import type {NextApiRequest, NextApiResponse} from 'next';
import {client} from '../../lib';
import {ratelimitMiddleware} from '../../middleware/ratelimit';
import {matchLink} from 'tiktok-dl-core';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const continueOrNah = await ratelimitMiddleware(req, res);
    if (typeof continueOrNah !== 'boolean') return;
    const keys = await client.keys('*');
    res.status(200).json(keys.filter((x) => matchLink(x)));
};
