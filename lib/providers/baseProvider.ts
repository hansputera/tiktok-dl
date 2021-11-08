import {Got} from 'got';

export interface ExtractedInfo {
    error?: string;
    result?: {
        thumb?: string;
        advanced?: Record<string, unknown>;
        urls: string[];
    }
};

/**
 * @class BaseProvider
 */
export abstract class BaseProvider {
    abstract client: Got;
    abstract resourceName(): string;
    abstract fetch(url: string): Promise<ExtractedInfo>;
    abstract extract(html: string): ExtractedInfo;
};
