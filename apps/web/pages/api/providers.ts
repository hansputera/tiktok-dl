import type { NextApiRequest, NextApiResponse } from "next";
import { Providers } from "tiktok-dl-core";
import { ratelimitMiddleware } from "../../middleware/ratelimit";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const continueOrNah = await ratelimitMiddleware(req, res);
  if (typeof continueOrNah !== "boolean") return;

  const providers = Providers.map((p) => ({
    name: p.resourceName(),
    url: p.client?.defaults.options.prefixUrl,
    maintenance: p.maintenance,
  }));

  return res.send(providers);
};
