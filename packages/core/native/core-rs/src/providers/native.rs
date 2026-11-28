//! Port of `nativeFetch.ts` and `nativeParse.ts`.

use crate::http;
use crate::links::match_tiktok_data;
use crate::util::{error_object, get, object};
use serde_json::Value;

/// Port of `nativeFetch` (`packages/core/src/units/nativeFetch.ts:5`).
pub async fn native_fetch(url: String, params: Value) -> Result<Value, String> {
    let parsed = url::Url::parse(&url).map_err(|_| "Invalid URL".to_owned())?;
    let origin = parsed.origin().ascii_serialization();
    let href = parsed.to_string();
    let path = format!(".{}", parsed.path());
    let user_agent = params
        .get("user-agent")
        .and_then(Value::as_str)
        .map(str::to_owned);

    let response = http::Request::new(&origin, &path)
        .header("Referer", Some(href))
        .header("Origin", Some(origin))
        .header("User-Agent", user_agent)
        .socket_timeout_ms(10_000)
        .send()
        .await?;
    native_extract(response.body)
}

/// Port of `nativeExtract` (`packages/core/src/units/nativeParse.ts:35`).
pub fn native_extract(html: String) -> Result<Value, String> {
    let matches = match_tiktok_data(html)?;
    if matches.is_empty() {
        return Ok(error_object("Something was wrong!"));
    }

    let page: Value =
        serde_json::from_str(&matches).map_err(|error| format!("SyntaxError: {error}"))?;
    let item_module = get(&page, "ItemModule");
    let Value::Object(items) = item_module else {
        return Err("TypeError: Cannot convert undefined or null to object".to_owned());
    };
    let Some(item) = items.values().next() else {
        return Err("TypeError: Cannot convert undefined or null to object".to_owned());
    };

    let video = get(item, "video");
    let music = get(item, "music");
    let stats = get(item, "stats");
    Ok(object(&[
        (
            "video",
            object(&[
                ("id", get(item, "id")),
                (
                    "urls",
                    Value::Array(vec![get(&video, "playAddr"), get(&video, "downloadAddr")]),
                ),
                ("thumb", get(&video, "cover")),
                ("duration", get(&video, "duration")),
            ]),
        ),
        (
            "music",
            object(&[
                ("url", get(&music, "playUrl")),
                ("title", get(&music, "title")),
                ("author", get(&music, "authorName")),
                ("id", get(&music, "id")),
                ("cover", get(&music, "coverLarge")),
                ("album", get(&music, "album")),
                ("duration", get(&music, "duration")),
            ]),
        ),
        (
            "author",
            object(&[
                ("username", get(item, "author")),
                ("id", get(item, "authorId")),
                ("thumb", get(item, "avatarThumb")),
                ("nick", get(item, "nickname")),
            ]),
        ),
        ("caption", get(item, "desc")),
        ("playsCount", get(&stats, "playCount")),
        ("sharesCount", get(&stats, "shareCount")),
        ("commentsCount", get(&stats, "commentCount")),
        ("likesCount", get(&stats, "diggCount")),
        ("uploadedAt", get(item, "createTime")),
    ]))
}
