import {copyFileSync, existsSync} from 'node:fs';
import {execFileSync, spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

if (process.env.CORE_RS_PREBUILT === '1') {
    process.exit(0);
}

const crate = fileURLToPath(new URL('../native/core-rs/', import.meta.url));
if (!existsSync(`${crate}Cargo.toml`)) {
    process.exit(0);
}

const env = {...process.env};

// Vercel's image ships rustup without a default toolchain, so cargo's rustup
// shim refuses to run. Use the first installed toolchain, or install stable.
if (!env.RUSTUP_TOOLCHAIN) {
    const list = spawnSync('rustup', ['toolchain', 'list'], {encoding: 'utf8'});
    if (!list.error) {
        const toolchain = (list.stdout ?? '')
            .split('\n')
            .map((line) => line.replace(/\s*\([^)]*\)\s*$/, '').trim())
            .filter((line) => line && !line.includes(' '))[0];

        if (toolchain) {
            env.RUSTUP_TOOLCHAIN = toolchain;
        } else {
            execFileSync('rustup', ['default', 'stable'], {stdio: 'inherit'});
            env.RUSTUP_TOOLCHAIN = 'stable';
        }
    }
}

execFileSync(
    'cargo',
    ['build', '--release', '--manifest-path', `${crate}Cargo.toml`],
    {stdio: 'inherit', env},
);

const library =
    process.platform === 'darwin'
        ? 'libcore_rs.dylib'
        : process.platform === 'win32'
          ? 'core_rs.dll'
          : 'libcore_rs.so';

copyFileSync(`${crate}target/release/${library}`, `${crate}core_rs.node`);
