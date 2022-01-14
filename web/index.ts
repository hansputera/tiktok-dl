import {FastifyInstance, FastifyPluginOptions} from 'fastify';
import FastifyRateLimit from 'fastify-rate-limit';
import {PingRoute, StoredLinksRoute, DownloadRoute} from './routers';
import {client} from '../lib';
import {rateLimitConfig} from '../config';

export default async (
    fastify: FastifyInstance,
    _: FastifyPluginOptions,
    done: (err?: Error) => void) => {
  if (rateLimitConfig.enable) {
    fastify.register(FastifyRateLimit, {
      redis: client,
      global: false,
      max: rateLimitConfig.maxRatelimit,
      ban: rateLimitConfig.maxRatelimit-1,
      cache: rateLimitConfig.ratelimitTime*1_000,
    });
  }
  // routers
  new PingRoute(fastify);
  new StoredLinksRoute(fastify);
  new DownloadRoute(fastify);

  done();
};
