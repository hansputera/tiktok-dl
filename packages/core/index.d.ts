import type {ZodObject} from 'zod';

export interface ExtractedInfo {
    error?: string;
    video?: {
        id?: string;
        thumb?: string;
        urls: string[];
        title?: string;
        duration?: string;
    };
    slides?: string[];
    music?: {
        url: string;
        title?: string;
        author?: string;
        id?: string;
        cover?: string;
        album?: string;
        duration?: number;
    };
    author?: {
        username?: string;
        thumb?: string;
        id?: string;
        nick?: string;
    };
    caption?: string;
    playsCount?: number;
    sharesCount?: number;
    commentsCount?: number;
    likesCount?: number;
    uploadedAt?: string;
    updatedAt?: string;
}

export interface MaintenanceProvider {
    reason: string;
}

export declare abstract class BaseProvider {
    abstract baseUrl?: string;
    abstract getParams(): ZodObject | undefined;
    abstract maintenance?: MaintenanceProvider;
    abstract resourceName(): string;
    abstract fetch(
        url: string,
        params?: Record<string, string>,
    ): Promise<ExtractedInfo>;
    abstract extract(html: string): ExtractedInfo | Promise<ExtractedInfo>;
}

export declare const Providers: BaseProvider[];

export declare function getProvider(
    name: string,
): BaseProvider | undefined;

export declare function getRandomProvider(): BaseProvider;

export declare function matchTikTokData(html: string): string;

export declare function matchLink(raw: string): string[] | null;

export declare function extractMusicalyDownImages(html: string): string[];

export declare function matchCustomDownload(
    baseUrl: string,
    raw: string,
): string[];

export declare function deObfuscate(html: string): string;

export declare function runObfuscatedScript(jsCode: string): string;

export declare function runObfuscatedReplaceEvalScript(
    jsCode: string,
): string;

export declare function deObfuscateSaveFromScript(
    scriptContent: string,
): string;
