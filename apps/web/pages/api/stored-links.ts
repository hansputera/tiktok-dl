import type {NextApiRequest, NextApiResponse} from 'next';
import {client} from '../../lib';
import {ratelimitMiddleware} from '../../middleware/ratelimit';
import {matchLink} from 'tiktok-dl-core';
import {applyRoute} from '../../middleware/apply';

export default applyRoute(
    async (req: NextApiRequest, res: NextApiResponse) => {
        await ratelimitMiddleware(req, res);
        const keys = await client.keys('*');
        return res.status(200).json(keys.filter((x) => matchLink(x)));
    },
    [ratelimitMiddleware],
);
