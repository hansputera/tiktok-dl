export interface ExtractedInfo {
    error?: string;
    result?: {
        thumb?: string;
        urls: string[];
    }
};

/**
 * @class BaseProvider
 */
export abstract class BaseProvider {
    abstract resourceName(): string;
    abstract fetch(url: string): Promise<ExtractedInfo>;
    abstract extract(html: string): ExtractedInfo;
    abstract getURI(): string;
};
