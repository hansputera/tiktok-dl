//! Port of `tikdownFetch.ts` and `tikdownParse.ts`.

use crate::http;
use crate::util::{error_object, object, regex, string};
use serde_json::Value;

/// Port of `tikdownFetch` (`packages/core/src/units/tikdownFetch.ts:7`).
pub async fn tikdown_fetch(url: String) -> Result<Value, String> {
    const BASE: &str = "https://tikdown.org";
    let response = http::Request::new(BASE, "./")
        .form(vec![("tiktok-url".to_owned(), url)])
        .send()
        .await?;

    if regex("(?i)please double")?.is_match(&response.body) {
        return Ok(error_object("Video not found"));
    }
    let Some(index_link) = regex(r#"\./index\.php\?url=[^'"]+"#)?.find(&response.body) else {
        return Ok(error_object("Couldnt find URL"));
    };

    let video = http::Request::new(BASE, index_link.as_str()).send().await?;
    if video.body.is_empty() {
        return Ok(error_object("Couldnt find downloaded URL"));
    }
    tikdown_extract(video.body, BASE.to_owned())
}

/// Port of `tikdownExtract` (`packages/core/src/units/tikdownParse.ts:4`).
pub fn tikdown_extract(html: String, base_url: String) -> Result<Value, String> {
    let prefix = http::prefix_url(&base_url)?;
    let base = url::Url::parse(&prefix).map_err(|_| "Invalid URL".to_owned())?;
    let joined = base
        .join(&format!("./{html}"))
        .map_err(|_| "Invalid URL".to_owned())?;
    Ok(object(&[(
        "video",
        object(&[("urls", Value::Array(vec![string(joined.as_str())]))]),
    )]))
}
