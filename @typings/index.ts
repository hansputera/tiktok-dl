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

export interface DownloadPayload {
    url: string;
    type: string;
    nocache?: string | boolean;
    rotateOnError?: string | boolean;
}