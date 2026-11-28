//! QuickJS evaluation of the obfuscated provider script.
//!
//! Each call gets a fresh runtime with a 64 MiB heap, a 1 MiB stack and a 2 s interrupt
//! handler, the same limits the NodeVM call uses in practice.

use std::time::{Duration, Instant};

/// Runs `source` with a CommonJS `module` in scope and returns `module.exports` as a string.
pub fn eval_module_export(source: &str) -> Result<String, String> {
    let runtime = rquickjs::Runtime::new().map_err(|error| error.to_string())?;
    runtime.set_memory_limit(64 * 1024 * 1024);
    runtime.set_max_stack_size(1024 * 1024);
    let start = Instant::now();
    runtime.set_interrupt_handler(Some(Box::new(move || {
        start.elapsed() > Duration::from_secs(2)
    })));

    let context = rquickjs::Context::full(&runtime).map_err(|error| error.to_string())?;
    context.with(|ctx| {
        ctx.eval::<(), _>("var module = { exports: {} };")
            .map_err(|error| error.to_string())?;
        ctx.eval::<(), _>(source.to_owned())
            .map_err(|error| error.to_string())?;
        let value = ctx
            .eval::<rquickjs::Value, _>("module.exports")
            .map_err(|error| error.to_string())?;
        match value.as_string() {
            Some(text) => text.to_string().map_err(|error| error.to_string()),
            None => Err("deobfuscated value is not a string".to_owned()),
        }
    })
}

/// Evaluates `let result = <script>;` and returns `JSON.stringify(result)`, or `None` when the
/// value has no JSON form (like `undefined`).
pub fn eval_expr_json(script: &str) -> Result<Option<String>, String> {
    let runtime = rquickjs::Runtime::new().map_err(|error| error.to_string())?;
    runtime.set_memory_limit(64 * 1024 * 1024);
    runtime.set_max_stack_size(1024 * 1024);
    let start = Instant::now();
    runtime.set_interrupt_handler(Some(Box::new(move || {
        start.elapsed() > Duration::from_secs(2)
    })));

    let context = rquickjs::Context::full(&runtime).map_err(|error| error.to_string())?;
    context.with(|ctx| {
        ctx.eval::<(), _>(format!("let result = {script};"))
            .map_err(|error| error.to_string())?;
        let value = ctx
            .eval::<rquickjs::Value, _>("JSON.stringify(result)")
            .map_err(|error| error.to_string())?;
        Ok(value.as_string().and_then(|text| text.to_string().ok()))
    })
}
