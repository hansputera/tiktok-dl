import type {NextApiRequest, NextApiResponse} from 'next';
import {Providers} from 'tiktok-dl-core';
import {ratelimitMiddleware} from '../../middleware/ratelimit';
import type {Shape} from 'ow';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    await ratelimitMiddleware(req, res);

    const providers = Providers.map((p) => ({
        name: p.resourceName(),
        url: p.client?.defaults.options.prefixUrl,
        maintenance: p.maintenance,
        params: p.getParams() ? Object.keys(p.getParams()!).map((x) => ({
            name: x,
            type: (p.getParams()![x] as Shape).type,
        })) : {},
    }));

    return res.send(providers);
};
