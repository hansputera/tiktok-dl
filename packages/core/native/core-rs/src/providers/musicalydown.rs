//! Port of `musicalydownFetch.ts` and `musicalydownParse.ts`.

use crate::http;
use crate::links::{extract_musicaly_down_images, match_link};
use crate::util::{UA, first_group, get, missing, object, regex, string, truthy, two_groups};
use serde_json::{Map, Value};

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
