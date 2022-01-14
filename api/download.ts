import type {VercelRequest, VercelResponse} from '@vercel/node';
import ow from 'ow';
import {getProvider, Providers} from '../lib/providers';
import {BaseProvider} from '../lib/providers/baseProvider';
import {rotateProvider} from '../lib/rotator';
import {ratelimitMiddleware} from '../middleware/ratelimit';

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    await ratelimitMiddleware(req);
    const providersType = Providers.map((p) => p.resourceName());
    ow(req.method === 'POST' ? req.body : req.query, ow.object.partialShape({
      'url': ow.string.url.validate((v) => ({
        'validator': /^http(s?)(:\/\/)([a-z]+\.)*tiktok\.com\/(.*)?\/(.*)?$/gi
            .test(v),
        'message': 'Expected (.*).tiktok.com',
      })),
      'type': ow.optional.string.validate((v) => ({
        'validator': typeof v === 'string' &&
         providersType.includes(v.toLowerCase()),
        'message': 'Invalid Provider, available provider is: ' +
          Providers.map((x) => x.resourceName()).join(', '),
      })),
      'nocache': req.method === 'POST' ?
        ow.optional.boolean : ow.optional.string,
      'rotateOnError': req.method === 'POST' ?
        ow.optional.boolean : ow.optional.string,
    }));

    const provider = getProvider((req.query && req.query.type ||
        req.body && req.body.type) ?? 'random');
    if (!provider) {
      return res.status(400).json({
        'error': 'Invalid provider',
        'providers': providersType,
      });
    }
    const result = await rotateProvider(
      provider as BaseProvider, (req.query && req.query.url ||
            req.body && req.body.url), req.method === 'POST' ?
             req.body.rotateOnError :
                !!req.query.rotateOnError);

    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({
      'error': (e as Error).message,
    });
  }
};
