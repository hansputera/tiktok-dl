import {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  HTTPMethods,
  RouteOptions,
} from 'fastify';

/**
 * @class RouterHandler
 */
export abstract class RouterHandler {
  /**
     * @param {FastifyInstance} fastify Fastify instance.
     * @param {string} route Route URL
     * @param {HTTPMethods} method Route Method
     * @param {RouteOptions} opts Fastify route options.
     */
  constructor(public fastify: FastifyInstance,
      route: string,
      method: HTTPMethods | HTTPMethods[],
      opts?: Omit<RouteOptions, 'handler' | 'url' | 'method'>) {
    this.fastify.route({
      url: route,
      handler: this.exec.bind(this),
      method,
      ...opts,
    });
  }

  /**
   * Execute route action.
   * @param {FastifyRequest} req Request instance.
   * @param {FastifyReply} reply Reply instance.
   */
    abstract exec(req: FastifyRequest, reply: FastifyReply): Promise<void>;
}
