//! Port of `fasttoksaveFetch.ts` and `fasttoksaveParse.ts`.

use crate::http;
use crate::util::{error_object, get, object, string, truthy};
use serde_json::Value;

/// Port of `fasttoksaveFetch` (`packages/core/src/units/fasttoksaveFetch.ts:6`).
pub async fn fasttoksave_fetch(url: String) -> Result<Value, String> {
    const BASE: &str = "https://www.fasttoksave.com/";
    let response = http::Request::new(BASE, "./en/wp-json/tiktok-downloader/v1/fetch")
        .body_json(object(&[("url", string(&url))]))
        .send()
        .await?;
    let json: Value =
        serde_json::from_str(&response.body).map_err(|error| format!("ParseError: {error}"))?;

    let code = json.get("code").cloned().unwrap_or(Value::Null);
    let data = get(&json, "data");
    if code.as_f64() == Some(-1.0) || !truthy(&data) {
        return Ok(error_object("Video not found."));
    }

    let duration = data
        .get("duration")
        .and_then(Value::as_f64)
        .map_or_else(|| "NaN".to_owned(), |value| (value * 1000.0).to_string());
    let music = get(&data, "music_info");
    Ok(object(&[
        (
            "video",
            object(&[
                (
                    "urls",
                    Value::Array(vec![get(&data, "play"), get(&data, "wmplay")]),
                ),
                ("thumb", get(&data, "cover")),
                ("duration", string(&duration)),
            ]),
        ),
        (
            "music",
            object(&[
                ("url", string("")),
                ("author", get(&music, "author")),
                ("cover", get(&music, "cover")),
                ("title", get(&music, "title")),
            ]),
        ),
        ("commentsCount", get(&data, "comment_count")),
        ("playsCount", get(&data, "play_count")),
        ("caption", get(&data, "title")),
    ]))
}

/// Port of `fasttoksaveExtract` (`packages/core/src/units/fasttoksaveParse.ts:3`).
pub fn fasttoksave_extract(html: String) -> Result<Value, String> {
    let _ = html;
    Ok(object(&[]))
}
