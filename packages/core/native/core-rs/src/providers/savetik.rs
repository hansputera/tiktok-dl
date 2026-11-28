//! Port of `savetikFetch.ts` and `savetikParse.ts`.

use crate::http;
use crate::util::{error_object, get, js_to_string, missing, object, string, truthy};
use serde_json::Value;

/// Port of `savetikFetch` (`packages/core/src/units/savetikFetch.ts:7`).
pub async fn savetik_fetch(url: String) -> Result<Value, String> {
    let response = http::Request::new("https://savetik.net", "./api/action")
        .search(&[("url", url.as_str())])
        .throw_http_errors(false)
        .send()
        .await?;
    if response.status == 400 {
        return Ok(error_object("Video not found"));
    }
    savetik_extract(response.body)
}

/// Port of `savetikExtract` (`packages/core/src/units/savetikParse.ts:3`).
pub fn savetik_extract(html: String) -> Result<Value, String> {
    let Ok(json) = serde_json::from_str::<Value>(&html) else {
        return Ok(error_object("Video not found"));
    };
    if truthy(&get(&json, "error")) {
        return Ok(object(&[("error", get(&json, "error"))]));
    }

    let duration = match json.get("duration") {
        None | Some(Value::Null) => {
            return Err("Cannot read properties of undefined (reading 'toString')".to_owned());
        }
        Some(value) => js_to_string(value)
            .ok_or_else(|| "Cannot read properties of undefined (reading 'toString')".to_owned())?,
    };
    let postinfo = get(&json, "postinfo");
    let stats = get(&json, "stats");
    let slides = match json.get("items") {
        None | Some(Value::Null) => missing(),
        Some(value) => value.clone(),
    };

    Ok(object(&[
        (
            "video",
            object(&[
                (
                    "urls",
                    Value::Array(vec![get(&json, "downloadUrl"), get(&json, "hdDownloadUrl")]),
                ),
                ("title", get(&postinfo, "media_title")),
                ("duration", string(&duration)),
            ]),
        ),
        ("slides", slides),
        (
            "author",
            object(&[
                ("username", get(&postinfo, "unique_id")),
                ("id", get(&postinfo, "uid")),
                ("nick", get(&postinfo, "username")),
                ("thumb", get(&postinfo, "avatar_url")),
            ]),
        ),
        ("sharesCount", get(&stats, "shareCount")),
        ("playsCount", get(&stats, "playCount")),
        ("commentsCount", get(&stats, "commentCount")),
    ]))
}
