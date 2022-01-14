import {RouterHandler} from '../route';
import {FastifyInstance, FastifyRequest, FastifyReply} from 'fastify';
import ow from 'ow';
import {Providers, getProvider, rotateProvider} from '../../lib';
import {BaseProvider} from '../../lib/providers/baseProvider';
import {DownloadPayload} from '../../@typings';

/**
 * @class DownloadRoute
 */
export class DownloadRoute extends RouterHandler {
  /**
     * @param {FastifyInstance} app
     */
  constructor(app: FastifyInstance) {
    super(app, '/download', ['GET', 'POST'], {
      preHandler: (req, _, next) => {
        try {
          const providersType = Providers.map((p) => p.resourceName());
          ow(req.body || req.query, ow.object.partialShape({
            'url': ow.string.url.validate((v) => ({
              // eslint-disable-next-line max-len
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

          next();
        } catch (e) {
          next({
            statusCode: 400,
            ...e as Error,
          });
        }
      },
    });
  }

  /**
   * @param {FastifyRequest} req
   * @param {FastifyReply} reply
   */
  async exec(req: FastifyRequest, reply: FastifyReply) {
    try {
      const provider = getProvider((req.query &&
                (req.query as DownloadPayload).type ||
            req.body &&
                (req.body as DownloadPayload).type) ?? 'random');
      if (!provider) {
        return reply.status(400).send({
          'error': 'Invalid provider',
        });
      }
      const result = await rotateProvider(
        provider as BaseProvider, (req.query &&
                (req.query as DownloadPayload).url ||
                req.body && (req.body as DownloadPayload).url),
        (req.query && !!(req.query as DownloadPayload).rotateOnError ||
                    !!(req.body &&
                            (req.body as DownloadPayload).rotateOnError)));
      reply.status(200).send(result);
    } catch (e) {
      reply.status(500).send({
        error: (e as Error).message,
      });
    }
  }
}
