//! JS bindings for `packages/core/src/units/`: generated from the signatures in `port.rs` by rust-anything.
//! Regenerate with `rust-anything refresh` after changing them.

use napi_derive::napi;

pub mod js;
pub mod port;
pub mod wire;

#[allow(unused_imports)]
use serde_json::Value;
pub mod utf16;

fn panic_message(payload: &(dyn std::any::Any + Send)) -> String {
    payload
        .downcast_ref::<&str>()
        .map(|s| (*s).to_string())
        .or_else(|| payload.downcast_ref::<String>().cloned())
        .unwrap_or_else(|| "unknown panic".into())
}

#[allow(dead_code)]
fn run<T>(f: impl FnOnce() -> Result<T, String>) -> napi::Result<T> {
    match std::panic::catch_unwind(std::panic::AssertUnwindSafe(f)) {
        Ok(result) => result.map_err(napi::Error::from_reason),
        Err(payload) => Err(napi::Error::from_reason(format!(
            "Rust panic: {}",
            panic_message(&*payload)
        ))),
    }
}

#[allow(dead_code)]
async fn run_async<T>(f: impl std::future::Future<Output = Result<T, String>>) -> napi::Result<T> {
    use futures::FutureExt as _;
    match std::panic::AssertUnwindSafe(f).catch_unwind().await {
        Ok(result) => result.map_err(napi::Error::from_reason),
        Err(payload) => Err(napi::Error::from_reason(format!(
            "Rust panic: {}",
            panic_message(&*payload)
        ))),
    }
}

/// `runObfuscatedScript`.
#[napi(js_name = "runObfuscatedScript")]
pub fn run_obfuscated_script(js_code: String) -> napi::Result<String> {
    run(move || {
        let out = port::run_obfuscated_script(js_code)?;
        Ok(out)
    })
}

/// `runObfuscatedReplaceEvalScript`.
#[napi(js_name = "runObfuscatedReplaceEvalScript")]
pub fn run_obfuscated_replace_eval_script(js_code: String) -> napi::Result<String> {
    run(move || {
        let out = port::run_obfuscated_replace_eval_script(js_code)?;
        Ok(out)
    })
}

/// `deObfuscate`.
#[napi(js_name = "deObfuscate")]
pub fn de_obfuscate(html: String) -> napi::Result<String> {
    run(move || {
        let out = port::de_obfuscate(html)?;
        Ok(out)
    })
}

/// `matchTikTokData`.
#[napi(js_name = "matchTikTokData")]
pub fn match_tik_tok_data(html: String) -> napi::Result<String> {
    run(move || {
        let out = port::match_tik_tok_data(html)?;
        Ok(out)
    })
}

/// `matchLink`.
#[napi(js_name = "matchLink")]
pub fn match_link(raw: String) -> napi::Result<String> {
    run(move || {
        let out = port::match_link(raw)?;
        crate::js::to_json(&out)
    })
}

/// `extractMusicalyDownImages`.
#[napi(js_name = "extractMusicalyDownImages")]
pub fn extract_musicaly_down_images(html: String) -> napi::Result<Vec<String>> {
    run(move || {
        let out = port::extract_musicaly_down_images(html)?;
        Ok(out)
    })
}

/// `matchCustomDownload`.
#[napi(js_name = "matchCustomDownload")]
pub fn match_custom_download(base_url: String, raw: String) -> napi::Result<Vec<String>> {
    run(move || {
        let out = port::match_custom_download(base_url, raw)?;
        Ok(out)
    })
}

/// `downtikFetch`.
#[napi(js_name = "downtikFetch")]
pub async fn downtik_fetch(url: String) -> napi::Result<String> {
    run_async(async move {
        let out = port::downtik_fetch(url).await?;
        crate::js::to_json(&out)
    })
    .await
}

/// `downtikExtract`.
#[napi(js_name = "downtikExtract")]
pub fn downtik_extract(html: String, base_url: String) -> napi::Result<String> {
    run(move || {
        let out = port::downtik_extract(html, base_url)?;
        crate::js::to_json(&out)
    })
}

/// `fasttoksaveFetch`.
#[napi(js_name = "fasttoksaveFetch")]
pub async fn fasttoksave_fetch(url: String) -> napi::Result<String> {
    run_async(async move {
        let out = port::fasttoksave_fetch(url).await?;
        crate::js::to_json(&out)
    })
    .await
}

/// `fasttoksaveExtract`.
#[napi(js_name = "fasttoksaveExtract")]
pub fn fasttoksave_extract(html: String) -> napi::Result<String> {
    run(move || {
        let out = port::fasttoksave_extract(html)?;
        crate::js::to_json(&out)
    })
}

/// `musicalydownFetch`.
#[napi(js_name = "musicalydownFetch")]
pub async fn musicalydown_fetch(url: String) -> napi::Result<String> {
    run_async(async move {
        let out = port::musicalydown_fetch(url).await?;
        crate::js::to_json(&out)
    })
    .await
}

/// `musicalydownExtract`.
#[napi(js_name = "musicalydownExtract")]
pub async fn musicalydown_extract(body: String) -> napi::Result<String> {
    run_async(async move {
        let out = port::musicalydown_extract(body).await?;
        crate::js::to_json(&out)
    })
    .await
}

/// `nativeFetch`.
#[napi(js_name = "nativeFetch")]
pub async fn native_fetch(url: String, params: String) -> napi::Result<String> {
    run_async(async move {
        let params = crate::js::from_json(&params)?;
        let out = port::native_fetch(url, params).await?;
        crate::js::to_json(&out)
    })
    .await
}

/// `nativeExtract`.
#[napi(js_name = "nativeExtract")]
pub fn native_extract(html: String) -> napi::Result<String> {
    run(move || {
        let out = port::native_extract(html)?;
        crate::js::to_json(&out)
    })
}

/// `savetikFetch`.
#[napi(js_name = "savetikFetch")]
pub async fn savetik_fetch(url: String) -> napi::Result<String> {
    run_async(async move {
        let out = port::savetik_fetch(url).await?;
        crate::js::to_json(&out)
    })
    .await
}

/// `savetikExtract`.
#[napi(js_name = "savetikExtract")]
pub fn savetik_extract(html: String) -> napi::Result<String> {
    run(move || {
        let out = port::savetik_extract(html)?;
        crate::js::to_json(&out)
    })
}

/// `snaptikFetch`.
#[napi(js_name = "snaptikFetch")]
pub async fn snaptik_fetch(url: String) -> napi::Result<String> {
    run_async(async move {
        let out = port::snaptik_fetch(url).await?;
        crate::js::to_json(&out)
    })
    .await
}

/// `snaptikExtract`.
#[napi(js_name = "snaptikExtract")]
pub fn snaptik_extract(html: String) -> napi::Result<String> {
    run(move || {
        let out = port::snaptik_extract(html)?;
        crate::js::to_json(&out)
    })
}

/// `tikdownFetch`.
#[napi(js_name = "tikdownFetch")]
pub async fn tikdown_fetch(url: String) -> napi::Result<String> {
    run_async(async move {
        let out = port::tikdown_fetch(url).await?;
        crate::js::to_json(&out)
    })
    .await
}

/// `tikdownExtract`.
#[napi(js_name = "tikdownExtract")]
pub fn tikdown_extract(html: String, base_url: String) -> napi::Result<String> {
    run(move || {
        let out = port::tikdown_extract(html, base_url)?;
        crate::js::to_json(&out)
    })
}

/// `tikmateFetch`.
#[napi(js_name = "tikmateFetch")]
pub async fn tikmate_fetch(url: String) -> napi::Result<String> {
    run_async(async move {
        let out = port::tikmate_fetch(url).await?;
        crate::js::to_json(&out)
    })
    .await
}

/// `tikmateExtract`.
#[napi(js_name = "tikmateExtract")]
pub fn tikmate_extract(html: String) -> napi::Result<String> {
    run(move || {
        let out = port::tikmate_extract(html)?;
        crate::js::to_json(&out)
    })
}

/// `ttdownloaderFetch`.
#[napi(js_name = "ttdownloaderFetch")]
pub async fn ttdownloader_fetch(url: String) -> napi::Result<String> {
    run_async(async move {
        let out = port::ttdownloader_fetch(url).await?;
        crate::js::to_json(&out)
    })
    .await
}

/// `ttdownloaderExtract`.
#[napi(js_name = "ttdownloaderExtract")]
pub fn ttdownloader_extract(html: String) -> napi::Result<String> {
    run(move || {
        let out = port::ttdownloader_extract(html)?;
        crate::js::to_json(&out)
    })
}

/// `savefromExtract`.
#[napi(js_name = "savefromExtract")]
pub fn savefrom_extract(html: String) -> napi::Result<String> {
    run(move || {
        let out = port::savefrom_extract(html)?;
        crate::js::to_json(&out)
    })
}

/// `deObfuscateSaveFromScript`.
#[napi(js_name = "deObfuscateSaveFromScript")]
pub fn de_obfuscate_save_from_script(script_content: String) -> napi::Result<String> {
    run(move || {
        let out = port::de_obfuscate_save_from_script(script_content)?;
        crate::js::to_json(&out)
    })
}

/// `savefromFetch`.
#[napi(js_name = "savefromFetch")]
pub async fn savefrom_fetch(url: String) -> napi::Result<String> {
    run_async(async move {
        let out = port::savefrom_fetch(url).await?;
        crate::js::to_json(&out)
    })
    .await
}

// ---- the binary wire ------------------------------------------------------------------------

type WireBuffers = (
    napi::bindgen_prelude::Uint8Array,
    napi::bindgen_prelude::Uint8Array,
    napi::bindgen_prelude::Uint32Array,
);

thread_local! {
    static WIRE: std::cell::RefCell<Option<WireBuffers>> = const { std::cell::RefCell::new(None) };
    static PENDING: std::cell::RefCell<Vec<u8>> = const { std::cell::RefCell::new(Vec::new()) };
    static SCRATCH: std::cell::RefCell<Vec<u8>> = const { std::cell::RefCell::new(Vec::new()) };
}

/// Registers the argument, result and argument-length buffers `index.cjs` uses.
#[napi(js_name = "rustAnythingWireInit")]
pub fn rust_anything_wire_init(
    input: napi::bindgen_prelude::Uint8Array,
    output: napi::bindgen_prelude::Uint8Array,
    len: napi::bindgen_prelude::Uint32Array,
) {
    WIRE.with(|w| *w.borrow_mut() = Some((input, output, len)));
}

/// Copies a result that did not fit into the (now larger) result buffer.
#[napi(js_name = "rustAnythingWireFlush")]
pub fn rust_anything_wire_flush() -> f64 {
    let bytes = PENDING.with(|p| std::mem::take(&mut *p.borrow_mut()));
    WIRE.with(|w| {
        let mut w = w.borrow_mut();
        let Some((_, output, _)) = w.as_mut() else {
            return -1.0;
        };
        // SAFETY: the call is synchronous; JS does not touch `output` until it returns.
        let out = unsafe { output.as_mut() };
        let n = bytes.len().min(out.len());
        out[..n].copy_from_slice(&bytes[..n]);
        n as f64
    })
}

/// Reads the argument bytes (`wLen[0]` of them), runs `f`, and writes its result; a negative
/// return is the size of a result that did not fit, kept for `rustAnythingWireFlush`.
fn wire_io(
    f: impl FnOnce(&mut wire::Reader, &mut wire::Writer) -> Result<(), String>,
) -> napi::Result<f64> {
    WIRE.with(|cell| {
        let mut guard = cell.borrow_mut();
        let Some((input, output, len)) = guard.as_mut() else {
            return Err(napi::Error::from_reason(
                "rust-anything: the wire buffers are not registered",
            ));
        };
        let len = (len.first().copied().unwrap_or(0) as usize).min(input.len());
        let mut w = wire::Writer(SCRATCH.with(|s| std::mem::take(&mut *s.borrow_mut())));
        w.0.clear();
        let result = run(|| f(&mut wire::Reader::new(&input[..len]), &mut w));
        let keep = |w: wire::Writer| SCRATCH.with(|s| *s.borrow_mut() = w.0);
        match result {
            // A result of another shape than the TS type: JS runs the call through JSON.
            Err(e) if e.reason.starts_with(wire::MISMATCH) => {
                keep(w);
                return Ok(f64::NAN);
            }
            Err(e) => {
                keep(w);
                let mut m = wire::Writer::default();
                m.string16(&e.reason);
                // SAFETY: the call is synchronous; JS does not touch `output` until it returns.
                let out = unsafe { output.as_mut() };
                if m.0.len() > out.len() {
                    return Err(e);
                }
                out[..m.0.len()].copy_from_slice(&m.0);
                return Ok(f64::INFINITY);
            }
            Ok(()) => {}
        }
        // SAFETY: the call is synchronous; JS does not touch `output` until it returns.
        let out = unsafe { output.as_mut() };
        let n = w.0.len();
        if n > out.len() {
            PENDING.with(|p| *p.borrow_mut() = w.0);
            return Ok(-(n as f64));
        }
        out[..n].copy_from_slice(&w.0);
        keep(w);
        Ok(n as f64)
    })
}

/// `runObfuscatedScript` over the binary wire.
#[napi(js_name = "runObfuscatedScriptWire")]
pub fn run_obfuscated_script_wire() -> napi::Result<f64> {
    wire_io(|r, w| {
        let js_code: String = r.string16()?;
        let out = &port::run_obfuscated_script(js_code)?;
        w.string16(out);
        Ok(())
    })
}

/// `runObfuscatedReplaceEvalScript` over the binary wire.
#[napi(js_name = "runObfuscatedReplaceEvalScriptWire")]
pub fn run_obfuscated_replace_eval_script_wire() -> napi::Result<f64> {
    wire_io(|r, w| {
        let js_code: String = r.string16()?;
        let out = &port::run_obfuscated_replace_eval_script(js_code)?;
        w.string16(out);
        Ok(())
    })
}

/// `deObfuscate` over the binary wire.
#[napi(js_name = "deObfuscateWire")]
pub fn de_obfuscate_wire() -> napi::Result<f64> {
    wire_io(|r, w| {
        let html: String = r.string16()?;
        let out = &port::de_obfuscate(html)?;
        w.string16(out);
        Ok(())
    })
}

/// `matchTikTokData` over the binary wire.
#[napi(js_name = "matchTikTokDataWire")]
pub fn match_tik_tok_data_wire() -> napi::Result<f64> {
    wire_io(|r, w| {
        let html: String = r.string16()?;
        let out = &port::match_tik_tok_data(html)?;
        w.string16(out);
        Ok(())
    })
}

/// `matchLink` over the binary wire.
#[napi(js_name = "matchLinkWire")]
pub fn match_link_wire() -> napi::Result<f64> {
    wire_io(|r, w| {
        let raw: String = r.string16()?;
        let out = &port::match_link(raw)?;
        match out {
            Some(x0) => {
                w.tag(1);
                w.tag(1);
                w.count(x0.len());
                for x1 in x0.iter() {
                    w.string16(x1);
                }
            }
            None => w.tag(2),
        }
        Ok(())
    })
}

/// `extractMusicalyDownImages` over the binary wire.
#[napi(js_name = "extractMusicalyDownImagesWire")]
pub fn extract_musicaly_down_images_wire() -> napi::Result<f64> {
    wire_io(|r, w| {
        let html: String = r.string16()?;
        let out = &port::extract_musicaly_down_images(html)?;
        w.tag(1);
        w.count(out.len());
        for x0 in out.iter() {
            w.string16(x0);
        }
        Ok(())
    })
}

/// `matchCustomDownload` over the binary wire.
#[napi(js_name = "matchCustomDownloadWire")]
pub fn match_custom_download_wire() -> napi::Result<f64> {
    wire_io(|r, w| {
        let base_url: String = r.string16()?;
        let raw: String = r.string16()?;
        let out = &port::match_custom_download(base_url, raw)?;
        w.tag(1);
        w.count(out.len());
        for x0 in out.iter() {
            w.string16(x0);
        }
        Ok(())
    })
}

static S_DOWNTIK_EXTRACT_OUT: wire::Schema = wire::Schema::Obj(&[
    ("error", wire::Schema::OptJs(&wire::Schema::Str16)),
    (
        "video",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("thumb", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("urls", wire::Schema::List(&wire::Schema::Str16)),
            ("title", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("duration", wire::Schema::OptJs(&wire::Schema::Str16)),
        ])),
    ),
    (
        "slides",
        wire::Schema::OptJs(&wire::Schema::List(&wire::Schema::Str16)),
    ),
    (
        "music",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("url", wire::Schema::Str16),
            ("title", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("author", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("cover", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("album", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("duration", wire::Schema::OptJs(&wire::Schema::Num)),
        ])),
    ),
    (
        "author",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("username", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("thumb", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("nick", wire::Schema::OptJs(&wire::Schema::Str16)),
        ])),
    ),
    ("caption", wire::Schema::OptJs(&wire::Schema::Str16)),
    ("playsCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("sharesCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("commentsCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("likesCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("uploadedAt", wire::Schema::OptJs(&wire::Schema::Str16)),
    ("updatedAt", wire::Schema::OptJs(&wire::Schema::Str16)),
]);

/// `downtikExtract` over the binary wire.
#[napi(js_name = "downtikExtractWire")]
pub fn downtik_extract_wire() -> napi::Result<f64> {
    wire_io(|r, w| {
        let html: String = r.string16()?;
        let base_url: String = r.string16()?;
        let out = &port::downtik_extract(html, base_url)?;
        wire::write_value(w, out, &S_DOWNTIK_EXTRACT_OUT)?;
        Ok(())
    })
}

static S_FASTTOKSAVE_EXTRACT_OUT: wire::Schema = wire::Schema::Obj(&[
    ("error", wire::Schema::OptJs(&wire::Schema::Str16)),
    (
        "video",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("thumb", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("urls", wire::Schema::List(&wire::Schema::Str16)),
            ("title", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("duration", wire::Schema::OptJs(&wire::Schema::Str16)),
        ])),
    ),
    (
        "slides",
        wire::Schema::OptJs(&wire::Schema::List(&wire::Schema::Str16)),
    ),
    (
        "music",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("url", wire::Schema::Str16),
            ("title", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("author", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("cover", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("album", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("duration", wire::Schema::OptJs(&wire::Schema::Num)),
        ])),
    ),
    (
        "author",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("username", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("thumb", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("nick", wire::Schema::OptJs(&wire::Schema::Str16)),
        ])),
    ),
    ("caption", wire::Schema::OptJs(&wire::Schema::Str16)),
    ("playsCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("sharesCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("commentsCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("likesCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("uploadedAt", wire::Schema::OptJs(&wire::Schema::Str16)),
    ("updatedAt", wire::Schema::OptJs(&wire::Schema::Str16)),
]);

/// `fasttoksaveExtract` over the binary wire.
#[napi(js_name = "fasttoksaveExtractWire")]
pub fn fasttoksave_extract_wire() -> napi::Result<f64> {
    wire_io(|r, w| {
        let html: String = r.string16()?;
        let out = &port::fasttoksave_extract(html)?;
        wire::write_value(w, out, &S_FASTTOKSAVE_EXTRACT_OUT)?;
        Ok(())
    })
}

static S_NATIVE_EXTRACT_OUT: wire::Schema = wire::Schema::Obj(&[
    ("error", wire::Schema::OptJs(&wire::Schema::Str16)),
    (
        "video",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("thumb", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("urls", wire::Schema::List(&wire::Schema::Str16)),
            ("title", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("duration", wire::Schema::OptJs(&wire::Schema::Str16)),
        ])),
    ),
    (
        "slides",
        wire::Schema::OptJs(&wire::Schema::List(&wire::Schema::Str16)),
    ),
    (
        "music",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("url", wire::Schema::Str16),
            ("title", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("author", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("cover", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("album", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("duration", wire::Schema::OptJs(&wire::Schema::Num)),
        ])),
    ),
    (
        "author",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("username", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("thumb", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("nick", wire::Schema::OptJs(&wire::Schema::Str16)),
        ])),
    ),
    ("caption", wire::Schema::OptJs(&wire::Schema::Str16)),
    ("playsCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("sharesCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("commentsCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("likesCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("uploadedAt", wire::Schema::OptJs(&wire::Schema::Str16)),
    ("updatedAt", wire::Schema::OptJs(&wire::Schema::Str16)),
]);

/// `nativeExtract` over the binary wire.
#[napi(js_name = "nativeExtractWire")]
pub fn native_extract_wire() -> napi::Result<f64> {
    wire_io(|r, w| {
        let html: String = r.string16()?;
        let out = &port::native_extract(html)?;
        wire::write_value(w, out, &S_NATIVE_EXTRACT_OUT)?;
        Ok(())
    })
}

static S_SAVETIK_EXTRACT_OUT: wire::Schema = wire::Schema::Obj(&[
    ("error", wire::Schema::OptJs(&wire::Schema::Str16)),
    (
        "video",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("thumb", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("urls", wire::Schema::List(&wire::Schema::Str16)),
            ("title", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("duration", wire::Schema::OptJs(&wire::Schema::Str16)),
        ])),
    ),
    (
        "slides",
        wire::Schema::OptJs(&wire::Schema::List(&wire::Schema::Str16)),
    ),
    (
        "music",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("url", wire::Schema::Str16),
            ("title", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("author", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("cover", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("album", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("duration", wire::Schema::OptJs(&wire::Schema::Num)),
        ])),
    ),
    (
        "author",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("username", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("thumb", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("nick", wire::Schema::OptJs(&wire::Schema::Str16)),
        ])),
    ),
    ("caption", wire::Schema::OptJs(&wire::Schema::Str16)),
    ("playsCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("sharesCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("commentsCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("likesCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("uploadedAt", wire::Schema::OptJs(&wire::Schema::Str16)),
    ("updatedAt", wire::Schema::OptJs(&wire::Schema::Str16)),
]);

/// `savetikExtract` over the binary wire.
#[napi(js_name = "savetikExtractWire")]
pub fn savetik_extract_wire() -> napi::Result<f64> {
    wire_io(|r, w| {
        let html: String = r.string16()?;
        let out = &port::savetik_extract(html)?;
        wire::write_value(w, out, &S_SAVETIK_EXTRACT_OUT)?;
        Ok(())
    })
}

static S_SNAPTIK_EXTRACT_OUT: wire::Schema = wire::Schema::Obj(&[
    ("error", wire::Schema::OptJs(&wire::Schema::Str16)),
    (
        "video",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("thumb", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("urls", wire::Schema::List(&wire::Schema::Str16)),
            ("title", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("duration", wire::Schema::OptJs(&wire::Schema::Str16)),
        ])),
    ),
    (
        "slides",
        wire::Schema::OptJs(&wire::Schema::List(&wire::Schema::Str16)),
    ),
    (
        "music",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("url", wire::Schema::Str16),
            ("title", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("author", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("cover", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("album", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("duration", wire::Schema::OptJs(&wire::Schema::Num)),
        ])),
    ),
    (
        "author",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("username", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("thumb", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("nick", wire::Schema::OptJs(&wire::Schema::Str16)),
        ])),
    ),
    ("caption", wire::Schema::OptJs(&wire::Schema::Str16)),
    ("playsCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("sharesCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("commentsCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("likesCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("uploadedAt", wire::Schema::OptJs(&wire::Schema::Str16)),
    ("updatedAt", wire::Schema::OptJs(&wire::Schema::Str16)),
]);

/// `snaptikExtract` over the binary wire.
#[napi(js_name = "snaptikExtractWire")]
pub fn snaptik_extract_wire() -> napi::Result<f64> {
    wire_io(|r, w| {
        let html: String = r.string16()?;
        let out = &port::snaptik_extract(html)?;
        wire::write_value(w, out, &S_SNAPTIK_EXTRACT_OUT)?;
        Ok(())
    })
}

static S_TIKDOWN_EXTRACT_OUT: wire::Schema = wire::Schema::Obj(&[
    ("error", wire::Schema::OptJs(&wire::Schema::Str16)),
    (
        "video",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("thumb", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("urls", wire::Schema::List(&wire::Schema::Str16)),
            ("title", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("duration", wire::Schema::OptJs(&wire::Schema::Str16)),
        ])),
    ),
    (
        "slides",
        wire::Schema::OptJs(&wire::Schema::List(&wire::Schema::Str16)),
    ),
    (
        "music",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("url", wire::Schema::Str16),
            ("title", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("author", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("cover", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("album", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("duration", wire::Schema::OptJs(&wire::Schema::Num)),
        ])),
    ),
    (
        "author",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("username", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("thumb", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("nick", wire::Schema::OptJs(&wire::Schema::Str16)),
        ])),
    ),
    ("caption", wire::Schema::OptJs(&wire::Schema::Str16)),
    ("playsCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("sharesCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("commentsCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("likesCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("uploadedAt", wire::Schema::OptJs(&wire::Schema::Str16)),
    ("updatedAt", wire::Schema::OptJs(&wire::Schema::Str16)),
]);

/// `tikdownExtract` over the binary wire.
#[napi(js_name = "tikdownExtractWire")]
pub fn tikdown_extract_wire() -> napi::Result<f64> {
    wire_io(|r, w| {
        let html: String = r.string16()?;
        let base_url: String = r.string16()?;
        let out = &port::tikdown_extract(html, base_url)?;
        wire::write_value(w, out, &S_TIKDOWN_EXTRACT_OUT)?;
        Ok(())
    })
}

static S_TIKMATE_EXTRACT_OUT: wire::Schema = wire::Schema::Obj(&[
    ("error", wire::Schema::OptJs(&wire::Schema::Str16)),
    (
        "video",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("thumb", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("urls", wire::Schema::List(&wire::Schema::Str16)),
            ("title", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("duration", wire::Schema::OptJs(&wire::Schema::Str16)),
        ])),
    ),
    (
        "slides",
        wire::Schema::OptJs(&wire::Schema::List(&wire::Schema::Str16)),
    ),
    (
        "music",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("url", wire::Schema::Str16),
            ("title", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("author", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("cover", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("album", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("duration", wire::Schema::OptJs(&wire::Schema::Num)),
        ])),
    ),
    (
        "author",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("username", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("thumb", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("nick", wire::Schema::OptJs(&wire::Schema::Str16)),
        ])),
    ),
    ("caption", wire::Schema::OptJs(&wire::Schema::Str16)),
    ("playsCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("sharesCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("commentsCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("likesCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("uploadedAt", wire::Schema::OptJs(&wire::Schema::Str16)),
    ("updatedAt", wire::Schema::OptJs(&wire::Schema::Str16)),
]);

/// `tikmateExtract` over the binary wire.
#[napi(js_name = "tikmateExtractWire")]
pub fn tikmate_extract_wire() -> napi::Result<f64> {
    wire_io(|r, w| {
        let html: String = r.string16()?;
        let out = &port::tikmate_extract(html)?;
        wire::write_value(w, out, &S_TIKMATE_EXTRACT_OUT)?;
        Ok(())
    })
}

static S_TTDOWNLOADER_EXTRACT_OUT: wire::Schema = wire::Schema::Obj(&[
    ("error", wire::Schema::OptJs(&wire::Schema::Str16)),
    (
        "video",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("thumb", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("urls", wire::Schema::List(&wire::Schema::Str16)),
            ("title", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("duration", wire::Schema::OptJs(&wire::Schema::Str16)),
        ])),
    ),
    (
        "slides",
        wire::Schema::OptJs(&wire::Schema::List(&wire::Schema::Str16)),
    ),
    (
        "music",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("url", wire::Schema::Str16),
            ("title", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("author", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("cover", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("album", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("duration", wire::Schema::OptJs(&wire::Schema::Num)),
        ])),
    ),
    (
        "author",
        wire::Schema::OptJs(&wire::Schema::Obj(&[
            ("username", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("thumb", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("id", wire::Schema::OptJs(&wire::Schema::Str16)),
            ("nick", wire::Schema::OptJs(&wire::Schema::Str16)),
        ])),
    ),
    ("caption", wire::Schema::OptJs(&wire::Schema::Str16)),
    ("playsCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("sharesCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("commentsCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("likesCount", wire::Schema::OptJs(&wire::Schema::Num)),
    ("uploadedAt", wire::Schema::OptJs(&wire::Schema::Str16)),
    ("updatedAt", wire::Schema::OptJs(&wire::Schema::Str16)),
]);

/// `ttdownloaderExtract` over the binary wire.
#[napi(js_name = "ttdownloaderExtractWire")]
pub fn ttdownloader_extract_wire() -> napi::Result<f64> {
    wire_io(|r, w| {
        let html: String = r.string16()?;
        let out = &port::ttdownloader_extract(html)?;
        wire::write_value(w, out, &S_TTDOWNLOADER_EXTRACT_OUT)?;
        Ok(())
    })
}
