//! Port of `downtikFetch.ts` and `downtikParse.ts`.

use crate::deobfuscate::run_obfuscated_script;
use crate::http;
use crate::links::{match_custom_download, match_link};
use crate::util::{error_object, first_group, get, missing, object, string, truthy};
use serde_json::Value;

/// Port of `downtikFetch` (`packages/core/src/units/downtikFetch.ts:7`).
pub async fn downtik_fetch(url: String) -> Result<Value, String> {
    const BASE: &str = "https://downtik.io";
    let response = http::Request::new(BASE, "./")
        .search(&[("lang", "en")])
        .send()
        .await?;
    let token = first_group(r#"id="token" value="([^"]+)""#, &response.body)?;

    let response_action = http::Request::new(BASE, "./action.php")
        .search(&[("lang", "en")])
        .form(vec![("url".to_owned(), url), ("token".to_owned(), token)])
        .header("cookie", response.headers.get("set-cookie").cloned())
        .header("Referer", Some("https://downtik.io/".to_owned()))
        .header("Origin", Some("https://downtik.io".to_owned()))
        .send()
        .await?;

    if let Ok(parsed) = serde_json::from_str::<Value>(&response_action.body)
        && truthy(&get(&parsed, "error"))
    {
        return Ok(object(&[("error", get(&parsed, "message"))]));
    }

    downtik_extract(response_action.body, BASE.to_owned())
}

/// Port of `downtikExtract` (`packages/core/src/units/downtikParse.ts:5`).
pub fn downtik_extract(html: String, base_url: String) -> Result<Value, String> {
    let urls = match_custom_download(base_url, html.clone())?;

    if urls.is_empty() {
        let script = run_obfuscated_script(html)?;
        let Some(mut links) = match_link(script)? else {
            return Ok(error_object("Couldn't match any links!"));
        };
        if links.is_empty() {
            return Ok(error_object("Couldn't match any links!"));
        }
        let thumb = links.remove(0);
        return Ok(object(&[(
            "video",
            object(&[
                ("thumb", string(&thumb)),
                (
                    "urls",
                    Value::Array(links.into_iter().map(Value::String).collect()),
                ),
            ]),
        )]));
    }

    let mut urls = urls;
    let music = urls.pop().unwrap_or_default();
    let thumb = if urls.is_empty() {
        missing()
    } else {
        string(&urls.remove(0))
    };
    Ok(object(&[
        ("music", object(&[("url", string(&music))])),
        (
            "video",
            object(&[
                ("thumb", thumb),
                (
                    "urls",
                    Value::Array(urls.into_iter().map(Value::String).collect()),
                ),
            ]),
        ),
    ]))
}
