import type {NextApiRequest, NextApiResponse} from 'next';
import {Providers} from 'tiktok-dl-core';
import {ratelimitMiddleware} from '../../middleware/ratelimit';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    await ratelimitMiddleware(req, res);

    const providers = Providers.map((p) => ({
        name: p.resourceName(),
        url: p.client?.defaults.options.prefixUrl,
        maintenance: p.maintenance,
        params: p.getParams() ?? {},
    }));

    return res.send(providers);
};
