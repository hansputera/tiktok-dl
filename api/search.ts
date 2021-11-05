import type { VercelRequest, VercelResponse } from '@vercel/node';
import ow from 'ow';

import { tiktok } from '../lib/tiktok';

const SearchType = ['trend', 'videos'];

export default async (req: VercelRequest, res: VercelResponse) => {
    try {
        ow(req.query, ow.object.exactShape({
            q: ow.string.minLength(5).maxLength(50),
            t: ow.optional.string.validate((v) => ({
                validator: typeof v === 'string' && SearchType.includes(v.toLowerCase()),
                message: 'Expected \'t\' is \'trend\' or \'videos\''
            }))
        }));

        const t = req.query.t ? '' : req.query.t?.toLowerCase();
        if (!t?.length || SearchType.indexOf(t) < 0) return res.status(400).json({ 'error': 'Invalid t' });

        switch(t) {
            case SearchType[0]:
                const result = await tiktok.searchPreview(req.query.q);
                return res.json({ error: null, ...result });
            default:
                return res.json({ error: 'Invalid t' });
        }
    } catch (e) {
        res.status(400).json({
            'error': (e as Error).message,
        });
    }
};
