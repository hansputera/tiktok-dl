import { BaseProvider, Providers } from "tiktok-dl-core";

const transformProvider = (provider: BaseProvider) => {
    const params = provider.getParams();

    return {
        name: provider.resourceName(),
        url: provider.client?.defaults.options.prefixUrl,
        maintenance: provider.maintenance,
        params: params ? Object.keys(params._zod.def.shape).map(k => ({
            name: k,
            type: params._zod.def.shape[k].def.type,
        })) : {},
    }
}

export async function GET() {
    return Response.json({
        data: Providers.map(transformProvider),
    });
}