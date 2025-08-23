import {NextApiRequest, NextApiResponse} from 'next';

type Middleware = (
    request: NextApiRequest,
    response: NextApiResponse,
) => Promise<undefined>;

export const applyRoute = (
    route: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
    middlewares: Middleware[],
) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const middleware:
            | {
                  message: string;
                  status: number;
              }
            | undefined = await Promise.all(middlewares.map((m) => m(req, res)))
            .catch((e) => ({
                message: e.message,
                status: 500,
            }))
            .then(() => undefined);
        if (middleware)
            return res.status(middleware.status).json({
                message: middleware.message,
                statusCode: middleware.status,
            });
        else return route(req, res);
    };
};
