//! Port of `tikmateFetch.ts` and `tikmateParse.ts`.

use crate::deobfuscate::de_obfuscate;
use crate::http;
use crate::links::match_link;
use crate::util::{UA, error_object, object, regex, string};
use serde_json::Value;

/// Port of `tikmateFetch` (`packages/core/src/units/tikmateFetch.ts:9`).
pub async fn tikmate_fetch(url: String) -> Result<Value, String> {
    const BASE: &str = "https://tikmate.io";
    let response = http::Request::new(BASE, "./")
        .header("User-Agent", Some(UA.to_owned()))
        .send()
        .await?;

    let token = regex(r#"(name|id)="(_)?token" value="([^"]+)""#)?
        .captures(&response.body)
        .map(|captures| {
            captures
                .get(3)
                .map(|found| found.as_str().to_owned())
                .unwrap_or_default()
        })
        .ok_or_else(|| "Cannot read properties of null (reading 'at')".to_owned())?;

    let cookies = response
        .headers
        .get("cookie")
        .cloned()
        .or_else(|| response.headers.get("set-cookie").cloned());
    let prefix = http::prefix_url(BASE)?;
    let mut form = vec![("url".to_owned(), url)];
    if !token.is_empty() {
        form.push(("token".to_owned(), token));
    }

    let abc = http::Request::new(BASE, "./abc.php")
        .form(form)
        .header("Origin", Some(prefix.clone()))
        .header("Referer", Some(prefix))
        .header("Cookie", cookies)
        .header("User-Agent", Some(UA.to_owned()))
        .send()
        .await?;
    tikmate_extract(abc.body)
}

/// Port of `tikmateExtract` (`packages/core/src/units/tikmateParse.ts:5`).
pub fn tikmate_extract(html: String) -> Result<Value, String> {
    let deobfuscated = de_obfuscate(html)?;
    let Some(mut matches) = match_link(deobfuscated)? else {
        return Ok(error_object("Couldn't match any links!"));
    };

    let thumb = matches.remove(0);
    Ok(object(&[(
        "video",
        object(&[
            ("thumb", string(&thumb)),
            (
                "urls",
                Value::Array(matches.into_iter().map(Value::String).collect()),
            ),
        ]),
    )]))
}
