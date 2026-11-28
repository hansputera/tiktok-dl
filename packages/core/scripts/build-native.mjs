import {copyFileSync, existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

if (process.env.CORE_RS_PREBUILT === '1') {
    process.exit(0);
}

const crate = fileURLToPath(new URL('../native/core-rs/', import.meta.url));
if (!existsSync(`${crate}Cargo.toml`)) {
    process.exit(0);
}

execFileSync(
    'cargo',
    ['build', '--release', '--manifest-path', `${crate}Cargo.toml`],
    {stdio: 'inherit'},
);

const library =
    process.platform === 'darwin'
        ? 'libcore_rs.dylib'
        : process.platform === 'win32'
          ? 'core_rs.dll'
          : 'libcore_rs.so';

copyFileSync(`${crate}target/release/${library}`, `${crate}core_rs.node`);
