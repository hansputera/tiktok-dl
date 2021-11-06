import type { VercelRequest, VercelResponse } from '@vercel/node';
import ow from 'ow';

import { tiktok } from '../lib';

const SearchType = ['trend', 'cards'];

export default async (req: VercelRequest, res: VercelResponse) => {
    if (!tiktok.isReady()) return res.status(500).json({
        'error': 'Missing SESSION'
    });
    try {
        ow(req.query, ow.object.exactShape({
            q: ow.string.minLength(3).maxLength(50),
            t: ow.string.validate((v) => ({
                validator: typeof v === 'string' && SearchType.includes(v.toLowerCase()),
                message: 'Expected \'t\' is \'trend\' or \'cards\''
            }))
        }));

        switch(req.query.t) {
            case SearchType[0]:
                const preview = await tiktok.searchPreview(req.query.q);
                return res.json({ error: null, ...preview });
            case SearchType[1]:
                const full = await tiktok.searchFull(req.query.q);
                return res.json({ error: null, ...full });

            default:
                return res.json({ error: 'Invalid \'t\'' });
        }
    } catch (e) {
        res.status(400).json({
            'error': (e as Error).message,
        });
    }
};
