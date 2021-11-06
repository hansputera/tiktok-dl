import type { VercelRequest, VercelResponse } from '@vercel/node';
import ow from 'ow';

import { snaptik } from '../lib';

export default async (req: VercelRequest, res: VercelResponse) => {
    try {
        ow(req.query, ow.object.exactShape({
            'url': ow.string.url,
        }));

        const result = await snaptik.fetchDownloadPage(req.query.url);
        return res.status(200).json(result);
    } catch(e) {
        return res.status(400).json({
            'error': (e as Error).message,
        });
    }
}