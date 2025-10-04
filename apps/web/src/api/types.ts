import { ExtractedInfo } from "tiktok-dl-core"

export type DownloadResponse = {
    data: ExtractedInfo & {
        provider: string;
    };
    message?: string;
}
