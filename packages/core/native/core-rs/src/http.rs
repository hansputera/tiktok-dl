//! HTTP with file-replay fixtures. Mirrors `packages/core/src/http.ts`.

use serde_json::Value;
use sha1::{Digest, Sha1};
use std::collections::BTreeMap;
use std::sync::LazyLock;
use std::time::Duration;
use url::Url;

const DEFAULT_USER_AGENT: &str = "got (https://github.com/sindresorhus/got)";

/// One request, in the shape `http.ts` takes.
#[derive(Clone, Default)]
pub struct Request {
    pub base: String,
    pub path: String,
    pub search: Vec<(String, String)>,
    pub form: Vec<(String, String)>,
    pub json: Option<Value>,
    pub headers: Vec<(String, Option<String>)>,
    pub throw_http_errors: Option<bool>,
    pub socket_timeout_ms: Option<u64>,
}

impl Request {
    pub fn new(base: &str, path: &str) -> Self {
        Self {
            base: base.to_owned(),
            path: path.to_owned(),
            ..Self::default()
        }
    }

    pub fn search(mut self, pairs: &[(&str, &str)]) -> Self {
        self.search = pairs
            .iter()
            .map(|(k, v)| ((*k).to_owned(), (*v).to_owned()))
            .collect();
        self
    }

    pub fn form(mut self, pairs: Vec<(String, String)>) -> Self {
        self.form = pairs;
        self
    }

    pub fn header(mut self, name: &str, value: Option<String>) -> Self {
        self.headers.push((name.to_owned(), value));
        self
    }

    pub fn body_json(mut self, value: Value) -> Self {
        self.json = Some(value);
        self
    }

    pub fn throw_http_errors(mut self, value: bool) -> Self {
        self.throw_http_errors = Some(value);
        self
    }

    pub fn socket_timeout_ms(mut self, value: u64) -> Self {
        self.socket_timeout_ms = Some(value);
        self
    }

    pub async fn send(self) -> Result<Response, String> {
        let plan = plan(&self)?;
        match std::env::var("TIKTOK_DL_HTTP_FIXTURES") {
            Ok(dir) => replay(&dir, &plan, &self),
            Err(_) => finish(&self, live(&plan, &self).await?),
        }
    }
}

/// The plan identifies a request for fixtures and for the replay key.
struct Plan {
    method: &'static str,
    url: Url,
    host: String,
    key: String,
}

pub struct Response {
    pub status: u16,
    pub status_message: String,
    pub body: String,
    pub headers: BTreeMap<String, String>,
}

pub fn prefix_url(base: &str) -> Result<String, String> {
    let href = Url::parse(base)
        .map_err(|_| "Invalid URL".to_owned())?
        .to_string();
    Ok(if href.ends_with('/') {
        href
    } else {
        format!("{href}/")
    })
}

fn sorted_pairs(values: &BTreeMap<String, String>, drop: &[&str]) -> String {
    values
        .iter()
        .filter(|(key, _)| !drop.contains(&key.as_str()))
        .map(|(key, value)| format!("{key}={value}"))
        .collect::<Vec<_>>()
        .join("&")
}

fn canonical_json(value: &Value) -> String {
    match value {
        Value::Array(items) => format!(
            "[{}]",
            items
                .iter()
                .map(canonical_json)
                .collect::<Vec<_>>()
                .join(",")
        ),
        Value::Object(map) => {
            let mut keys: Vec<&String> = map.keys().collect();
            keys.sort();
            format!(
                "{{{}}}",
                keys.iter()
                    .map(|key| format!(
                        "{}:{}",
                        Value::String((*key).clone()),
                        canonical_json(&map[*key])
                    ))
                    .collect::<Vec<_>>()
                    .join(",")
            )
        }
        other => other.to_string(),
    }
}

fn plan(request: &Request) -> Result<Plan, String> {
    let prefix = prefix_url(&request.base)?;
    let mut url =
        Url::parse(&format!("{prefix}{}", request.path)).map_err(|_| "Invalid URL".to_owned())?;

    if !request.search.is_empty() {
        url.set_query(None);
        {
            let mut pairs = url.query_pairs_mut();
            pairs.clear();
            for (key, value) in &request.search {
                pairs.append_pair(key, value);
            }
        }
    }

    let method = if !request.form.is_empty() || request.json.is_some() {
        "POST"
    } else {
        "GET"
    };
    let no_query = format!("{}{}", url.origin().ascii_serialization(), url.path());
    let host = match url.port() {
        Some(port) => format!("{}:{port}", url.host_str().unwrap_or_default()),
        None => url.host_str().unwrap_or_default().to_owned(),
    };
    let query: BTreeMap<String, String> = url
        .query_pairs()
        .map(|(key, value)| (key.into_owned(), value.into_owned()))
        .collect();
    let form: BTreeMap<String, String> = request
        .form
        .iter()
        .map(|(key, value)| (key.clone(), value.clone()))
        .collect();
    let payload = match (&request.json, form.is_empty()) {
        (_, false) => sorted_pairs(&form, &["ts", "_ts"]),
        (Some(json), true) => canonical_json(json),
        (None, true) => String::new(),
    };

    let mut hasher = Sha1::new();
    hasher.update(format!(
        "{method}\n{no_query}\n{}\n{payload}",
        sorted_pairs(&query, &[])
    ));
    let key = hex::encode(hasher.finalize())[..16].to_owned();

    Ok(Plan {
        method,
        url,
        host,
        key,
    })
}

fn status_message_of(status: &reqwest::StatusCode) -> String {
    status.canonical_reason().unwrap_or("<none>").to_owned()
}

fn finish(request: &Request, response: Response) -> Result<Response, String> {
    if request.throw_http_errors.unwrap_or(true) && !(200..=299).contains(&response.status) {
        return Err(format!(
            "Response code {} ({})",
            response.status, response.status_message
        ));
    }
    Ok(response)
}

fn replay(dir: &str, plan: &Plan, request: &Request) -> Result<Response, String> {
    let relative = format!("{}/{}-{}.json", plan.host, plan.method, plan.key);
    let text = std::fs::read_to_string(format!("{dir}/{relative}"))
        .map_err(|_| format!("NO_FIXTURE {relative}"))?;
    let value: Value = serde_json::from_str(&text).map_err(|error| error.to_string())?;

    if let Some(message) = value.get("error").and_then(Value::as_str) {
        return Err(message.to_owned());
    }

    let mut headers: BTreeMap<String, String> = BTreeMap::new();
    if let Some(entries) = value.get("headers").and_then(Value::as_array) {
        for entry in entries {
            let pair = entry.as_array();
            let name = pair
                .and_then(|p| p.first())
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_lowercase();
            let header = pair
                .and_then(|p| p.get(1))
                .and_then(Value::as_str)
                .unwrap_or_default();
            match headers.get(&name) {
                Some(previous) if name == "set-cookie" => {
                    headers.insert(name, format!("{previous}, {header}"));
                }
                _ => {
                    headers.insert(name, header.to_owned());
                }
            }
        }
    }

    finish(
        request,
        Response {
            status: value.get("status").and_then(Value::as_u64).unwrap_or(0) as u16,
            status_message: value
                .get("statusMessage")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_owned(),
            body: value
                .get("body")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_owned(),
            headers,
        },
    )
}

static CLIENT: LazyLock<Result<reqwest::Client, String>> = LazyLock::new(|| {
    reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::limited(10))
        .build()
        .map_err(|error| error.to_string())
});

fn client() -> Result<&'static reqwest::Client, String> {
    CLIENT.as_ref().map_err(Clone::clone)
}

async fn live(plan: &Plan, request: &Request) -> Result<Response, String> {
    use reqwest::header::{CONTENT_TYPE, HeaderMap, HeaderName, HeaderValue, USER_AGENT};

    if plan.url.scheme() != "http" && plan.url.scheme() != "https" {
        return Err(format!("Unsupported protocol: {}:", plan.url.scheme()));
    }

    let mut headers = HeaderMap::new();
    for (name, value) in &request.headers {
        let Some(value) = value else { continue };
        let name = HeaderName::from_bytes(name.as_bytes()).map_err(|error| error.to_string())?;
        let value = HeaderValue::from_str(value).map_err(|error| error.to_string())?;
        headers.append(name, value);
    }
    if !headers.contains_key(USER_AGENT) {
        headers.insert(USER_AGENT, HeaderValue::from_static(DEFAULT_USER_AGENT));
    }
    let has_content_type = request
        .headers
        .iter()
        .any(|(name, value)| value.is_some() && name.eq_ignore_ascii_case("content-type"));

    let mut builder = client()?.request(
        if plan.method == "POST" {
            reqwest::Method::POST
        } else {
            reqwest::Method::GET
        },
        plan.url.clone(),
    );
    builder = builder.headers(headers);

    let body = if !request.form.is_empty() {
        let mut serializer = url::form_urlencoded::Serializer::new(String::new());
        for (key, value) in &request.form {
            serializer.append_pair(key, value);
        }
        if !has_content_type {
            builder = builder.header(CONTENT_TYPE, "application/x-www-form-urlencoded");
        }
        Some(serializer.finish())
    } else if let Some(json) = &request.json {
        builder = builder.header(CONTENT_TYPE, "application/json");
        Some(serde_json::to_string(json).map_err(|error| error.to_string())?)
    } else {
        None
    };
    if let Some(body) = body {
        builder = builder.body(body);
    }
    if let Some(timeout) = request.socket_timeout_ms {
        builder = builder.timeout(Duration::from_millis(timeout));
    }

    let response = builder.send().await.map_err(|error| error.to_string())?;
    let status = response.status();
    let mut headers: BTreeMap<String, String> = BTreeMap::new();
    for (name, value) in response.headers() {
        let key = name.as_str().to_lowercase();
        let value = String::from_utf8_lossy(value.as_bytes()).into_owned();
        match headers.get(&key) {
            Some(previous) if key == "set-cookie" => {
                headers.insert(key, format!("{previous}, {value}"));
            }
            _ => {
                headers.insert(key, value);
            }
        }
    }
    let body = response.text().await.map_err(|error| error.to_string())?;

    Ok(Response {
        status: status.as_u16(),
        status_message: status_message_of(&status),
        body,
        headers,
    })
}
