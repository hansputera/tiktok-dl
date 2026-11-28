//! The port entry point used by the generated napi bindings in `lib.rs`.
//!
//! The implementation lives in `deobfuscate`, `links`, and `providers::<name>`.

pub use crate::deobfuscate::{
    de_obfuscate, de_obfuscate_save_from_script, run_obfuscated_replace_eval_script,
    run_obfuscated_script,
};
pub use crate::links::{
    extract_musicaly_down_images, match_custom_download, match_link, match_tiktok_data,
};
pub use crate::providers::{
    downtik_extract, downtik_fetch, fasttoksave_extract, fasttoksave_fetch, musicalydown_extract,
    musicalydown_fetch, native_extract, native_fetch, savefrom_extract, savefrom_fetch,
    savetik_extract, savetik_fetch, snaptik_extract, snaptik_fetch, tikdown_extract, tikdown_fetch,
    tikmate_extract, tikmate_fetch, ttdownloader_extract, ttdownloader_fetch,
};
