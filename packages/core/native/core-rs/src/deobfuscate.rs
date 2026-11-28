//! Port of `deobfuscate.ts`: provider script evaluation.

use crate::jsengine;
use crate::util::{js_trim, missing, regex};
use serde_json::Value;

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
