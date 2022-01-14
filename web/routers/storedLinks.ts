import {RouterHandler} from '../route';
import {FastifyInstance, FastifyRequest, FastifyReply} from 'fastify';
import {client} from '../../lib/redis';
import {matchLink} from '../../lib/providers/util';

/**
 * @class StoredLinksRoute
 */
export class StoredLinksRoute extends RouterHandler {
  /**
     * @param {FastifyInstance} app Fastify app instance.
     */
  constructor(app: FastifyInstance) {
    super(app, '/stored-links', 'GET');
  }

  /**
     * Execute route action.
     * @param {FastifyRequest} _
     * @param {FastifyReply} reply Fastify reply
     */
  async exec(_: FastifyRequest, reply: FastifyReply): Promise<void> {
    const keys = await client.keys('*');

    reply.status(200).send(keys.filter((x) => matchLink(x)));
  }
}
