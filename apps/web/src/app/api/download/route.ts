import { downloadValidator } from "@/validators/download.validator";
import { rotateProvider } from "@/services/rotator";
import { NextRequest } from "next/server";
import { getProvider } from "tiktok-dl-core";

export async function POST(request: NextRequest) {
    try {
        const json = await request.json();
        const safeData = await downloadValidator.safeParseAsync(json);

        if (safeData.error || !safeData.success) {
            return Response.json({
                errors: safeData.error,
                message: 'Validation errors',
            }, {
                status: 400,
            });
        }

        const provider = getProvider(safeData.data.type);
        if (!provider) {
            return Response.json({
                message: 'Provider not found',
            }, { status: 404 });
        }

        const params = provider?.getParams();
        if (params) {
            const safeDataParams = await params.safeParseAsync(safeData.data.params);
            if (safeDataParams.error || !safeDataParams.success) {
                return Response.json({
                    errors: safeDataParams.error,
                    message: 'Validation errors in params!',
                }, {
                    status: 400,
                });
            }
        }

        const result = await rotateProvider(provider, safeData.data.url, safeData.data.rotateOnError, safeData.data.params);
        return Response.json({
            data: result,
        });
    } catch (e) {
        return Response.json({
            message: (e as Error).message,
        }, {
            status: 500,
        });
    }
}

export async function GET() {
    return Response.json({
        message: 'Currently we moved to POST method only.',
    });
}