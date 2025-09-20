import {Got} from 'got';
import {ZodObject} from 'zod';

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

/**
 * @class BaseProvider
 */
export abstract class BaseProvider {
    abstract client?: Got;
    abstract getParams(): ZodObject | undefined;
    abstract maintenance?: MaintenanceProvider;
    abstract resourceName(): string;
    abstract fetch(
        url: string,
        params?: Record<string, string>,
    ): Promise<ExtractedInfo>;
    abstract extract(html: string): ExtractedInfo | Promise<ExtractedInfo>;
}
