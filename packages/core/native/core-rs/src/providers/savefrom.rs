//! Port of `savefromFetch.ts` and `savefromParse.ts`.

use crate::deobfuscate::de_obfuscate_save_from_script;
use crate::http;
use crate::util::{get, missing, object, regex};
use serde_json::Value;

/// Port of `savefromExtract` (`packages/core/src/units/savefromParse.ts:4`).
pub fn savefrom_extract(html: String) -> Result<Value, String> {
    let deobfuscated = de_obfuscate_save_from_script(html)?;
    let Some(text) = deobfuscated.as_str() else {
        return Err("deobfuscated.match is not a function".to_owned());
    };
    let found = regex(r"\(\{(.*)\}\)")?
        .captures(text)
        .and_then(|captures| captures.get(0))
        .map(|found| found.as_str().to_owned())
        .ok_or_else(|| "Cannot read properties of null (reading '0')".to_owned())?;
    let stripped = found.replace(['(', ')'], "");
    let json: Value =
        serde_json::from_str(&stripped).map_err(|error| format!("SyntaxError: {error}"))?;
    let meta = get(&json, "meta");
    let urls = match json.get("url").and_then(Value::as_array) {
        Some(items) => Value::Array(items.iter().map(|item| get(item, "url")).collect()),
        None => missing(),
    };

    Ok(object(&[(
        "video",
        object(&[
            ("thumb", get(&json, "thumb")),
            ("id", get(&json, "id")),
            ("urls", urls),
            ("duration", get(&meta, "duration")),
            ("title", get(&meta, "title")),
        ]),
    )]))
}

/// Port of `savefromFetch` (`packages/core/src/units/savefromFetch.ts:9`).
pub async fn savefrom_fetch(url: String) -> Result<Value, String> {
    const BASE: &str = "https://worker.savefrom.net";
    const UA: &str = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

    fn now() -> String {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|elapsed| elapsed.as_millis().to_string())
            .unwrap_or_default()
    }

    let first = http::Request::new("https://en1.savefrom.net", "./")
        .send()
        .await?;
    let response = http::Request::new(BASE, "./savefrom.php")
        .form(vec![
            ("sf_url".to_owned(), url.clone()),
            ("sf_submit".to_owned(), String::new()),
            ("new".to_owned(), "2".to_owned()),
            ("lang".to_owned(), "en".to_owned()),
            ("country".to_owned(), "id".to_owned()),
            ("os".to_owned(), "Linux".to_owned()),
            ("browser".to_owned(), "Brave".to_owned()),
            ("channel".to_owned(), "main".to_owned()),
            ("sf-nomad".to_owned(), "1".to_owned()),
            ("url".to_owned(), url),
            ("ts".to_owned(), now()),
            ("_ts".to_owned(), now()),
            ("_tsc".to_owned(), "0".to_owned()),
        ])
        .header("Origin", Some("https://en1.savefrom.net".to_owned()))
        .header("Referer", Some("https://en1.savefrom.net".to_owned()))
        .header("User-Agent", Some(UA.to_owned()))
        .header("Cookies", first.headers.get("set-cookie").cloned())
        .send()
        .await?;

    savefrom_extract(response.body)
}
