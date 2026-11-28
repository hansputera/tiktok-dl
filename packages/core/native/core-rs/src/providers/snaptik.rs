//! Port of `snaptikFetch.ts` and `snaptikParse.ts`.

use crate::deobfuscate::run_obfuscated_replace_eval_script;
use crate::http;
use crate::links::match_link;
use crate::util::{first_group, object, string};
use serde_json::Value;

/// Port of `snaptikFetch` (`packages/core/src/units/snaptikFetch.ts:7`).
pub async fn snaptik_fetch(url: String) -> Result<Value, String> {
    const BASE: &str = "https://snaptik.app/en";
    let token_response = http::Request::new(BASE, "./").send().await?;
    let token = first_group(r#"name="token" value="([^"]+)""#, &token_response.body)?;

    let response = http::Request::new(BASE, "./abc2.php")
        .search(&[
            ("url", url.as_str()),
            ("token", token.as_str()),
            ("lang", "ID2"),
        ])
        .header("Cookie", token_response.headers.get("set-cookie").cloned())
        .send()
        .await?;
    snaptik_extract(response.body)
}

/// Port of `snaptikExtract` (`packages/core/src/units/snaptikParse.ts:5`).
pub fn snaptik_extract(html: String) -> Result<Value, String> {
    let script = run_obfuscated_replace_eval_script(html)?;
    let Some(mut results) = match_link(script)? else {
        return Err("Broken".to_owned());
    };
    if results.is_empty() {
        return Err("Broken".to_owned());
    }

    let thumb = results.remove(0);
    let end = results.len().saturating_sub(1);
    let mut seen: Vec<String> = Vec::new();
    for url in &results[..end] {
        if !seen.contains(url) {
            seen.push(url.clone());
        }
    }
    Ok(object(&[(
        "video",
        object(&[
            ("thumb", string(&thumb)),
            (
                "urls",
                Value::Array(seen.into_iter().map(Value::String).collect()),
            ),
        ]),
    )]))
}
