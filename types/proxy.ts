export interface ProxyResult {
    supportHttps: boolean;
    protocol: string;
    ip: string;
    port: string;
    get: boolean;
    post: boolean;
    cookie: boolean;
    referer: boolean;
    'user-agent': boolean;
    anonymityLevel: number;
    websites: {
        example: boolean;
        google: boolean;
        amazon: boolean;
        yelp: boolean;
        google_maps: boolean;
    };
    county: string;
    unixTimestampMs: number;
    tsChecked: boolean;
    unixTimestamp: boolean;
    curl: string;
    ipPort: string;
    type: string;
    speed: number;
    otherProtocols: Record<string, unknown>;
    verifiedSecondsAgo: number;
};
