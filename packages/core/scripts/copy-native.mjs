import {copyFileSync, existsSync, mkdirSync, readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const crate = fileURLToPath(new URL('../native/core-rs/', import.meta.url));
const dest = fileURLToPath(new URL('../dist/native/core-rs/', import.meta.url));

if (!existsSync(`${crate}index.cjs`)) {
    process.exit(0);
}

mkdirSync(dest, {recursive: true});
copyFileSync(`${crate}index.cjs`, `${dest}index.cjs`);
for (const file of readdirSync(crate)) {
    if (file.endsWith('.node')) {
        copyFileSync(`${crate}${file}`, `${dest}${file}`);
    }
}
