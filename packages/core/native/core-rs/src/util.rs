//! Helpers shared by the provider modules.

use crate::js;
use regex::Regex;
use serde_json::{Map, Value};

pub const UA: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

pub fn regex(pattern: &str) -> Result<Regex, String> {
    Regex::new(pattern).map_err(|error| error.to_string())
}

pub fn object(pairs: &[(&str, Value)]) -> Value {
    let mut map = Map::new();
    for (key, value) in pairs {
        map.insert((*key).to_owned(), value.clone());
    }
    Value::Object(map)
}

pub fn string(value: &str) -> Value {
    Value::String(value.to_owned())
}

pub fn missing() -> Value {
    js::undefined()
}

pub fn get(value: &Value, key: &str) -> Value {
    value.get(key).cloned().unwrap_or_else(missing)
}

pub fn truthy(value: &Value) -> bool {
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

pub fn js_to_string(value: &Value) -> Option<String> {
    match value {
        Value::String(text) => Some(text.clone()),
        Value::Number(number) => Some(number.to_string()),
        Value::Bool(flag) => Some(flag.to_string()),
        Value::Null => None,
        Value::Array(_) | Value::Object(_) => None,
    }
}

pub fn js_trim(text: &str) -> &str {
    text.trim_matches(|c: char| c.is_whitespace() || c == '\u{FEFF}')
}

pub fn first_group(pattern: &str, text: &str) -> Result<String, String> {
    regex(pattern)?
        .captures(text)
        .and_then(|captures| captures.get(1))
        .map(|found| found.as_str().to_owned())
        .ok_or_else(|| "Cannot read properties of null (reading '1')".to_owned())
}

pub fn two_groups(pattern: &str, text: &str) -> Result<(String, String), String> {
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

pub fn error_object(message: &str) -> Value {
    object(&[("error", string(message))])
}
