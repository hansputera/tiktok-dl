import { Shape } from "ow";
import { BaseProvider, Providers } from "tiktok-dl-core";

const transformProvider = (provider: BaseProvider) => {
    const params = provider.getParams();

    return {
        name: provider.resourceName(),
        url: provider.client?.defaults.options.prefixUrl,
        maintenance: provider.maintenance,
        params: params ? Object.keys(params).map(key => ({
            name: key,
            type: (params?.[key] as Shape | undefined)?.type,
        })) : {},
    }
}

export async function GET() {
    return Response.json({
        data: Providers.map(transformProvider),
    });
}