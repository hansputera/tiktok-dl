/** SEARCH PREVIEW */
interface SearchPreviewSugPos {
    begin: number;
    end: number;
}

interface SearchPreviewSugWordRecord {
    group_id: string;
    words_position: number;
    words_content: string;
    words_source: string;
}

interface SearchPreviewSugExtraInfo {
    cut_query: string;
    lang: string;
    recall_reason: string;
}

interface SearchPreviewSug {
    pos: SearchPreviewSugPos[];
    content: string;
    sug_type: string;
    word_record: SearchPreviewSugWordRecord;
    extra_info: SearchPreviewSugExtraInfo;
}

export interface SearchPreviewTypeResult {
    sug_list: SearchPreviewSug[];
    // other record ignored because i think that isn't important
}
/** END SEARCH PREVIEW */

/** SEARCH FULL */
export interface UserResult {
    user_info: {
        uid: string;
        nickname: string;
        signature: string;
        avatar_thumb: {
            uri: string;
            url_list: string[];
            width: number;
            height: number;
        };
        follow_status: number;
        follower_count: number;
        custom_verify?: string;
        unique_id?: string;
        room_id: number;
        enterprise_verify_reason?: string;
        cover_url?: string;
        sec_uid: string;
    }
}

interface Video {
    id: string;
    height: number;
    width: number;
    duration: number;
    ratio: string;
    cover: string;
    originCover: string;
    dynamicCover: string;
    playAddr: string;
    downloadAddr: string;
    shareCover: string[];
    reflowCover: string;
    bitrate: number;
    encodedType: string;
    format: string;
    videoQuality: string;
    encodeUserTag: string;
};

interface Author {
    id: string;
    uniqueId: string;
    nickname: string;
    avatarThumb: string;
    avatarMedium: string;
    avatarLarge: string;
    signature: string;
    verified: boolean;
    secUid: string;
    secret: boolean;
    ftc: boolean;
    relation: number;
    openFavorite: boolean;
    commentSetting: number;
    duetSetting: number;
    stitchSetting: number;
    privateAccount: boolean;
};

interface Music {
    id: string;
    title: string;
    playUrl: string;
    coverThumb: string;
    coverMedium: string;
    coverLarge: string;
    authorName: string;
    original: boolean;
    duration: number;
    album: string;
};

interface Stats {
    diggCount: number;
    shareCount: number;
    commentCount: number;
    playCount: number;
};

interface TextExtra {
    awemeid: string;
    start: number;
    end: number;
    hashtagName: string;
    hastagId: string;
    type: number;
    userId: string;
    isCommerce: boolean;
    userUniqueId: string;
    secUid: string;
};

interface StickerItem {
    stickerType: number;
    stickerText: string[];
};

export interface VideoItemResult {
    id: string;
    desc: string;
    createTime: number;
    video: Video;
    author: Author;
    music: Music;
    stats: Stats;
    authorStats: Omit<Stats, 'playCount' | 'commentCount' | 'shareCount'> & {
        followingCount: number;
        followerCount: number;
        heartCount: number;
        videoCount: number;
    };
    textExtra: TextExtra[];
    stickersOnItem: StickerItem[];
}

export interface SearchFullResult {
    data: {
        type: number;
        user_list?: UserResult[];
        item?: VideoItemResult;
    }[];
}
/** END SEARCH FULL */