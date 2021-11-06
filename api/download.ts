import type { VercelRequest, VercelResponse } from '@vercel/node';
import ow from 'ow';

import { snaptik } from '../lib/snaptik';

export default async (req: VercelRequest, res: VercelResponse) => {
    try {
        ow(req.query, ow.object.exactShape({
            'url': ow.string.url,
        }));

        await snaptik.fetchDownloadPage(req.query.url);
        return res.status(200).json({ 'error': null });
    } catch(e) {
        return res.status(400).json({
            'error': (e as Error).message,
        });
    }
}