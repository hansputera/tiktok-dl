import fastify from 'fastify';
import {VercelRequest, VercelResponse} from '@vercel/node';

const app = fastify({
  trustProxy: true,
});

app.register(
    import('../web'),
);

export default async (req: VercelRequest, res: VercelResponse) => {
  await app.ready();
  app.server.emit('request', req, res);
};
