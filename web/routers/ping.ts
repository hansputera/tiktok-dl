import {RouterHandler} from '../route';
import {FastifyInstance, FastifyRequest, FastifyReply} from 'fastify';
import {fetch} from '../../lib';

/**
 * @class PingRoute
 */
export class PingRoute extends RouterHandler {
  /**
     * @param {FastifyInstance} app
     */
  constructor(app: FastifyInstance) {
    super(app, '/ping', 'GET');
  }

  /**
   * @param {FastifyRequest} _
   * @param {FastifyReply} reply
   */
  async exec(_: FastifyRequest, reply: FastifyReply) {
    const start = Date.now();
    try {
      const response = await fetch('./');
      reply.status(200).send({
        status: response.statusCode,
        took: Date.now() - start,
        data: response.statusMessage || 'Nothing.',
      });
    } catch {
      reply.status(500).send({
        'status': null,
        'data': null,
        'took': null,
      });
    }
  }
}
