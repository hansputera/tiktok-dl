//! The Rust port of `packages/core/src/units/`.
//!
//! Mirrors the TypeScript bodies one to one; `http` replays the recorded provider traffic and
//! `jsengine` runs the obfuscated provider script in QuickJS.

#[path = "http.rs"]
mod http;
#[path = "jsengine.rs"]
mod jsengine;

use crate::js;
use regex::Regex;
use serde_json::{Map, Value};

const UA: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const MATCH_LINK: &str = r#"(?i-u)https?://(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_+.~#?&/=]*"#;

fn regex(pattern: &str) -> Result<Regex, String> {
    Regex::new(pattern).map_err(|error| error.to_string())
}

fn object(pairs: &[(&str, Value)]) -> Value {
    let mut map = Map::new();
    for (key, value) in pairs {
        map.insert((*key).to_owned(), value.clone());
    }
    Value::Object(map)
}

fn string(value: &str) -> Value {
    Value::String(value.to_owned())
}

fn missing() -> Value {
    js::undefined()
}

fn get(value: &Value, key: &str) -> Value {
    value.get(key).cloned().unwrap_or_else(missing)
}

fn truthy(value: &Value) -> bool {
    match value {
        Value::Null => false,
        Value::Bool(flag) => *flag,
        Value::Number(number) => number
            .as_f64()
            .is_some_and(|float| float != 0.0 && !float.is_nan()),
        Value::String(text) => !text.is_empty(),
        Value::Array(_) | Value::Object(_) => !js::is_undefined(value),
    }
}

fn js_to_string(value: &Value) -> Option<String> {
    match value {
        Value::String(text) => Some(text.clone()),
        Value::Number(number) => Some(number.to_string()),
        Value::Bool(flag) => Some(flag.to_string()),
        Value::Null => None,
        Value::Array(_) | Value::Object(_) => None,
    }
}

fn js_trim(text: &str) -> &str {
    text.trim_matches(|c: char| c.is_whitespace() || c == '\u{FEFF}')
}

fn first_group(pattern: &str, text: &str) -> Result<String, String> {
    regex(pattern)?
        .captures(text)
        .and_then(|captures| captures.get(1))
        .map(|found| found.as_str().to_owned())
        .ok_or_else(|| "Cannot read properties of null (reading '1')".to_owned())
}

fn two_groups(pattern: &str, text: &str) -> Result<(String, String), String> {
    regex(pattern)?
        .captures(text)
        .and_then(|captures| {
            Some((
                captures.get(1)?.as_str().to_owned(),
                captures.get(2)?.as_str().to_owned(),
            ))
        })
        .ok_or_else(|| "Cannot read properties of null (reading '1')".to_owned())
}

fn error_object(message: &str) -> Value {
    object(&[("error", string(message))])
}

/// Port of `runObfuscatedScript` (`packages/core/src/units/deobfuscate.ts:3`).
pub fn run_obfuscated_script(js_code: String) -> Result<String, String> {
    let transformed = js_trim(&js_code).to_owned().replacen("eval", "", 1);
    let pattern = regex(r"(?i)\(function([^\n])?\(h")?;
    let script = pattern
        .replace(&transformed, "module.exports = (function (h")
        .into_owned();
    jsengine::eval_module_export(&script)
}

/// Port of `runObfuscatedReplaceEvalScript` (`packages/core/src/units/deobfuscate.ts:20`).
pub fn run_obfuscated_replace_eval_script(js_code: String) -> Result<String, String> {
    run_obfuscated_script(js_code.replacen("eval", "module.exports = ", 1))
}

/// Port of `deObfuscate` (`packages/core/src/units/deobfuscate.ts:24`).
pub fn de_obfuscate(html: String) -> Result<String, String> {
    let has_error = regex("(?i)error")?.is_match(&html);
    if has_error {
        let message = regex("(?i)((url)? error)|could")?;
        let text = html
            .split('\'')
            .find(|part| message.is_match(part))
            .unwrap_or_default();
        return Err(text.to_owned());
    }

    let scripts = regex("(?i)<script[\\s\\S]*?>[\\s\\S]*?</script>")?;
    let Some(found) = scripts.find(&html) else {
        return Err("Cannot download the video!".to_owned());
    };

    let strip = regex(r#"<(/?)?script( type="[^\n]+")?>"#)?;
    let stripped = strip.replace_all(found.as_str(), "").into_owned();
    run_obfuscated_script(js_trim(&stripped).to_owned())
}

/// Port of `matchTikTokData` (`packages/core/src/units/links.ts:1`).
pub fn match_tik_tok_data(html: String) -> Result<String, String> {
    let pattern = regex(
        r#"window\['SIGI_STATE'\]=(.*)</script><script id="__LOADABLE_REQUIRED_CHUNKS__" type="application/json">"#,
    )?;
    let Some(captures) = pattern.captures(&html) else {
        return Ok(String::new());
    };
    let data = captures
        .get(1)
        .map(|found| found.as_str())
        .unwrap_or_default();
    let strip = regex("(?i);window[^\n]+")?;
    Ok(strip.replace_all(data, "").into_owned())
}

/// Port of `matchLink` (`packages/core/src/units/links.ts:14`).
pub fn match_link(raw: String) -> Result<Option<Vec<String>>, String> {
    let found: Vec<String> = regex(MATCH_LINK)?
        .find_iter(&raw)
        .map(|found| found.as_str().to_owned())
        .collect();
    Ok(if found.is_empty() { None } else { Some(found) })
}

/// Port of `extractMusicalyDownImages` (`packages/core/src/units/links.ts:21`).
pub fn extract_musicaly_down_images(html: String) -> Result<Vec<String>, String> {
    Ok(regex(r#"(?i)<img[^>]+src="(https[^"]+)""#)?
        .captures_iter(&html)
        .filter_map(|captures| captures.get(1))
        .map(|found| found.as_str().to_owned())
        .collect())
}

/// Port of `matchCustomDownload` (`packages/core/src/units/links.ts:26`).
pub fn match_custom_download(base_url: String, raw: String) -> Result<Vec<String>, String> {
    let links = match_link(raw.clone())?;
    let prefix = http::prefix_url(&base_url)?;
    let prefix = prefix.strip_suffix('/').unwrap_or(&prefix).to_owned();

    let download = regex(r#"(?i)/download.php\?token=(.*?)""#)?;
    let urls: Vec<String> = download
        .find_iter(&raw)
        .map(|found| {
            let full: Vec<char> = found.as_str().chars().collect();
            let end = full.len().saturating_sub(3);
            format!("{prefix}{}", full[..end].iter().collect::<String>())
        })
        .collect();

    if urls.is_empty() {
        return Ok(Vec::new());
    }

    let mut first =
        links.ok_or_else(|| "Cannot read properties of null (reading '0')".to_owned())?;
    if first.is_empty() {
        return Err("Cannot read properties of undefined (reading '0')".to_owned());
    }
    let mut result = vec![first.remove(0)];
    result.extend(urls);
    Ok(result)
}

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

/// Port of `musicalydownFetch` (`packages/core/src/units/musicalydownFetch.ts:9`).
pub async fn musicalydown_fetch(url: String) -> Result<Value, String> {
    const BASE: &str = "https://musicaldown.com/id";
    let prefix = http::prefix_url(BASE)?;
    let response = http::Request::new(BASE, "./")
        .header("Accept", Some("*/*".to_owned()))
        .header("Referer", Some(prefix.clone()))
        .header("Origin", Some(prefix.clone()))
        .header("User-Agent", Some(UA.to_owned()))
        .send()
        .await?;

    let tokens = two_groups(
        r#"input name="([^"]+)" type="hidden" value="([^"]+)""#,
        &response.body,
    )?;
    let field = first_group(r#"input name="([^"]+)"#, &response.body)?;
    let cookie = response.headers.get("set-cookie").cloned();

    let download = http::Request::new(BASE, "./download")
        .form(vec![
            (field, url),
            (tokens.0, tokens.1),
            ("verify".to_owned(), "1".to_owned()),
        ])
        .header("Cookie", cookie.clone())
        .header("Accept", Some("*/*".to_owned()))
        .header("Referer", Some(prefix.clone()))
        .header("Origin", Some(prefix.clone()))
        .header("User-Agent", Some(UA.to_owned()))
        .send()
        .await?;

    let mut headers = Map::new();
    if let Some(value) = cookie {
        headers.insert("Cookie".to_owned(), string(&value));
    }
    headers.insert("Accept".to_owned(), string("*/*"));
    headers.insert("Referer".to_owned(), string(&prefix));
    headers.insert("Origin".to_owned(), string(&prefix));
    headers.insert("User-Agent".to_owned(), string(UA));

    let body = object(&[
        ("html", string(&download.body)),
        ("headers", Value::Object(headers)),
    ]);
    let body = serde_json::to_string(&body).map_err(|error| error.to_string())?;
    musicalydown_extract(body).await
}

/// Port of `musicalydownExtract` (`packages/core/src/units/musicalydownParse.ts:5`).
pub async fn musicalydown_extract(body: String) -> Result<Value, String> {
    let parsed: Value =
        serde_json::from_str(&body).map_err(|error| format!("SyntaxError: {error}"))?;
    let html = parsed
        .get("html")
        .and_then(Value::as_str)
        .unwrap_or_default()
        .to_owned();
    let headers = parsed.get("headers").cloned().unwrap_or(Value::Null);

    let matched = match_link(html.clone())?.unwrap_or_default();
    let images = extract_musicaly_down_images(html.clone())?;

    let is_slide = images.len() > 2;
    let non_images: Vec<String> = matched
        .iter()
        .filter(|url| url.contains("images"))
        .cloned()
        .collect();
    let image = matched.iter().find(|url| url.contains("images")).cloned();

    let mut video = object(&[
        (
            "urls",
            Value::Array(if is_slide {
                Vec::new()
            } else {
                non_images.iter().cloned().map(Value::String).collect()
            }),
        ),
        ("thumb", image.map_or_else(missing, Value::String)),
    ]);
    let slides = if is_slide {
        Value::Array(images.iter().skip(1).cloned().map(Value::String).collect())
    } else {
        missing()
    };
    let author = if is_slide {
        missing()
    } else {
        object(&[(
            "thumb",
            images.first().cloned().map_or_else(missing, Value::String),
        )])
    };
    let music = if is_slide {
        missing()
    } else {
        object(&[(
            "url",
            non_images
                .first()
                .cloned()
                .map_or_else(missing, Value::String),
        )])
    };

    if is_slide {
        let token = regex(r#"data:\s*"([^"]+)""#)?
            .captures(&html)
            .and_then(|captures| captures.get(1))
            .map(|found| found.as_str().to_owned());

        let mut request = http::Request::new("https://render.muscdn.app", "./slider").form(vec![(
            "data".to_owned(),
            token.unwrap_or_else(|| "undefined".to_owned()),
        )]);
        if let Value::Object(map) = &headers {
            for (name, value) in map {
                if let Some(text) = value.as_str() {
                    request = request.header(name, Some(text.to_owned()));
                }
            }
        }
        let response = request.send().await?;
        let json: Value =
            serde_json::from_str(&response.body).map_err(|error| format!("ParseError: {error}"))?;
        let url = json.get("url").and_then(Value::as_str);
        if truthy(&get(&json, "success"))
            && let Some(url) = url
            && !url.is_empty()
            && let Value::Object(map) = &mut video
        {
            map.insert("urls".to_owned(), Value::Array(vec![string(url)]));
        }
    }

    Ok(object(&[
        ("video", video),
        ("slides", slides),
        ("author", author),
        ("music", music),
    ]))
}

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
    let matches = match_tik_tok_data(html)?;
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

/// Port of `deObfuscateSaveFromScript` (`packages/core/src/units/deobfuscate.ts:46`).
///
/// The original evaluates `let result = <script>` in a NodeVM and returns the assignment
/// value; valid scripts return the object, undefined scripts return `undefined`.
pub fn de_obfuscate_save_from_script(script_content: String) -> Result<Value, String> {
    match jsengine::eval_expr_json(&script_content)? {
        Some(text) => serde_json::from_str(&text).map_err(|error| error.to_string()),
        None => Ok(missing()),
    }
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
