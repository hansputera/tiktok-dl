//! One module per provider.

pub mod downtik;
pub mod fasttoksave;
pub mod musicalydown;
pub mod native;
pub mod savefrom;
pub mod savetik;
pub mod snaptik;
pub mod tikdown;
pub mod tikmate;
pub mod ttdownloader;

pub use downtik::{downtik_extract, downtik_fetch};
pub use fasttoksave::{fasttoksave_extract, fasttoksave_fetch};
pub use musicalydown::{musicalydown_extract, musicalydown_fetch};
pub use native::{native_extract, native_fetch};
pub use savefrom::{savefrom_extract, savefrom_fetch};
pub use savetik::{savetik_extract, savetik_fetch};
pub use snaptik::{snaptik_extract, snaptik_fetch};
pub use tikdown::{tikdown_extract, tikdown_fetch};
pub use tikmate::{tikmate_extract, tikmate_fetch};
pub use ttdownloader::{ttdownloader_extract, ttdownloader_fetch};
