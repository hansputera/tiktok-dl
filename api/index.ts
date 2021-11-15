import type {VercelRequest, VercelResponse} from '@vercel/node';

export default async (_: VercelRequest, res: VercelResponse) => {
  res.json({
    'index': 'Hello world!',
    'endpoints': {
      'ping': '/api/ping',
      'download': '/api/download',
    },
  });
};
