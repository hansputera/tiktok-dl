'use strict';

const {createRequire} = require('node:module');
const {join} = require('node:path');
const zod = require('zod');

const native = createRequire(__filename)(
    join(__dirname, 'native', 'core-rs', 'index.cjs'),
);

const z = zod.z ?? zod;

const definitions = [
    ['snaptik', 'https://snaptik.app/en'],
    ['tikmate', 'https://tikmate.io'],
    ['musicalydown', 'https://musicaldown.com/id'],
    ['ttdownloader', 'https://ttdownloader.com'],
    ['savefrom', 'https://worker.savefrom.net'],
    ['savetik', 'https://savetik.net'],
    ['tikdown', 'https://tikdown.org'],
    ['downtik', 'https://downtik.io'],
    ['native', undefined],
    ['fasttoksave', 'https://www.fasttoksave.com/'],
];

const params = {
    native: z.object({'user-agent': z.string().min(5)}),
};

const maintenance = {
    savefrom: {reason: 'Need further investigation.'},
};

class BaseProvider {
    #name;

    constructor(name, baseUrl) {
        this.#name = name;
        this.baseUrl = baseUrl;
        this.maintenance = maintenance[name];
    }

    resourceName() {
        return this.#name;
    }

    getParams() {
        return params[this.#name];
    }

    fetch(url, options) {
        return this.#name === 'native'
            ? native.nativeFetch(url, options ?? {})
            : native[`${this.#name}Fetch`](url);
    }

    extract(html) {
        return this.#name === 'tikdown' || this.#name === 'downtik'
            ? native[`${this.#name}Extract`](html, this.baseUrl)
            : native[`${this.#name}Extract`](html);
    }
}

const Providers = definitions.map(
    ([name, baseUrl]) => new BaseProvider(name, baseUrl),
);

const getRandomProvider = () => {
    const provider = Providers[Math.floor(Math.random() * Providers.length)];
    while (provider.resourceName() === 'native') {
        return getRandomProvider();
    }

    return provider;
};

const getProvider = (name) =>
    name.toLowerCase() !== 'random'
        ? Providers.find((p) => p.resourceName() === name.toLowerCase())
        : getRandomProvider();

module.exports = {
    BaseProvider,
    Providers,
    getProvider,
    getRandomProvider,
    matchTikTokData: native.matchTikTokData,
    matchLink: native.matchLink,
    extractMusicalyDownImages: native.extractMusicalyDownImages,
    matchCustomDownload: native.matchCustomDownload,
    deObfuscate: native.deObfuscate,
    runObfuscatedScript: native.runObfuscatedScript,
    runObfuscatedReplaceEvalScript: native.runObfuscatedReplaceEvalScript,
    deObfuscateSaveFromScript: native.deObfuscateSaveFromScript,
};
