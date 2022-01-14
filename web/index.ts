import {FastifyInstance, FastifyPluginOptions} from 'fastify';

export default async (
    fastify: FastifyInstance,
    _: FastifyPluginOptions,
    done: (err?: Error) => void) => {

  fastify.get('/docs', (_, reply) => {
      reply.redirect(301, 'https://docs.tiktok-dl.tslab.site');
  });
  // API
  fastify.register(import('./api'), {
      prefix: '/api',
  });
  done();
};
