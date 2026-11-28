//! Port of `links.ts`: URL and SIGI_STATE matching.

use crate::http;
use crate::util::regex;

const MATCH_LINK: &str = r#"(?i-u)https?://(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_+.~#?&/=]*"#;

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
