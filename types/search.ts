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