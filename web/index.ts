import {FastifyInstance, FastifyPluginOptions} from 'fastify';
import {PingRoute, StoredLinksRoute, DownloadRoute} from './routers';

export default async (
    fastify: FastifyInstance,
    _: FastifyPluginOptions,
    done: (err?: Error) => void) => {
  // routers
  new PingRoute(fastify);
  new StoredLinksRoute(fastify);
  new DownloadRoute(fastify);
  
  done();
};
