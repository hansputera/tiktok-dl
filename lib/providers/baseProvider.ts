import {Got} from 'got';

export interface ExtractedInfo {
    error?: string;
    video?: {
        id?: string;
        thumb?: string;
        urls: string[];
        title?: string;
        duration?: string;
    };
    music?: {
        url: string;
        title?: string;
        author?: string;
        id?: string;
        cover?: string;
    };
    author?: {
        username?: string;
        thumb?: string;
        id?: string;
    };
    caption?: string;
    playsCount?: number;
    sharesCount?: number;
    commentsCount?: number;
    likesCount?: number;
    uploadedAt?: string;
    updatedAt?: string;
};

export interface MaintenanceProvider {
    reason: string;
};

/**
 * @class BaseProvider
 */
export abstract class BaseProvider {
    abstract client: Got;
    abstract maintenance?: MaintenanceProvider;
    abstract resourceName(): string;
    abstract fetch(url: string): Promise<ExtractedInfo>;
    abstract extract(html: string): ExtractedInfo;
};
