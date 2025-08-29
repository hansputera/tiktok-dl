import { getTikTokURL } from "@/lib/utils";
import { Providers } from "tiktok-dl-core";
import z from "zod";

export const downloadValidator = z.object({
    url: z.url().refine((url) => getTikTokURL(url), {
        error: 'Invalid VT URL',
    }),
    type: z.enum(Providers.map(provider => provider.resourceName()).concat('random')),
    rotateOnError: z.boolean().default(true),
    nocache: z.boolean().default(false),
    params: z.object().optional(),
});
