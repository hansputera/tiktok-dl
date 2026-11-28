//! Port of `ttdownloaderFetch.ts` and `ttdownloaderParse.ts`.

use crate::http;
use crate::links::match_link;
use crate::util::{first_group, missing, object, regex, string};
use serde_json::Value;

/// Port of `ttdownloaderFetch` (`packages/core/src/units/ttdownloaderFetch.ts:7`).
pub async fn ttdownloader_fetch(url: String) -> Result<Value, String> {
    const BASE: &str = "https://ttdownloader.com";
    let first = http::Request::new(BASE, "./").send().await?;
    let token = first_group(r#"name="token" value="(.*)?""#, &first.body)?;

    let response = http::Request::new(BASE, "./search")
        .form(vec![
            ("token".to_owned(), token),
            ("format".to_owned(), String::new()),
            ("url".to_owned(), url),
        ])
        .header("Origin", Some("https://ttdownloader.com".to_owned()))
        .header("Referer", Some("https://ttdownloader.com".to_owned()))
        .header("Cookie", first.headers.get("set-cookie").cloned())
        .send()
        .await?;
    ttdownloader_extract(response.body)
}

/// Port of `ttdownloaderExtract` (`packages/core/src/units/ttdownloaderParse.ts:4`).
pub fn ttdownloader_extract(html: String) -> Result<Value, String> {
    let mut urls = match_link(html)?;
    if let Some(list) = urls.as_mut() {
        list.pop();
    }
    let music = match urls.as_ref() {
        Some(list) => {
            let pattern = regex("(?i)mp3")?;
            list.iter().find(|url| pattern.is_match(url)).cloned()
        }
        None => None,
    };
    let video: Vec<String> = urls
        .unwrap_or_default()
        .into_iter()
        .filter(|url| Some(url) != music.as_ref())
        .collect();

    Ok(object(&[
        (
            "video",
            object(&[(
                "urls",
                Value::Array(video.into_iter().map(Value::String).collect()),
            )]),
        ),
        (
            "music",
            music.map_or_else(missing, |url| object(&[("url", string(&url))])),
        ),
    ]))
}
