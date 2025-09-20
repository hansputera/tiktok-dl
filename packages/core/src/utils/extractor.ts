import {getProvider} from '..';
import type {BaseProvider} from '../base';

import {NodeVM} from 'vm2';

export const matchTikTokData = (html: string): string => {
    const data = html.match(
        // eslint-disable-next-line max-len
        /window\['SIGI_STATE'\]=(.*)<\/script><script id="__LOADABLE_REQUIRED_CHUNKS__" type="application\/json">/,
    );

    if (data) {
        return data[1].replace(/;window.+/gi, '');
    } else {
        return '';
    }
};

export const runObfuscatedReplaceEvalScript = (jsCode: string): string => {
    return runObfuscatedScript(jsCode.replace('eval', 'module.exports = '));
};

export const extractMusicalyDownImages = (html: string): string[] => {
    const regex = /<img[^>]+src="(https[^"]+)"/gi;
    return [...html.matchAll(regex)].map((m) => m[1]);
};

export const runObfuscatedScript = (jsCode: string): string => {
    const transformed = jsCode
        .trim()
        .replace('eval', '')
        .replace(/\(function(.)?\(h/gi, 'module.exports = (function (h');
    const deObfuscated = new NodeVM({
        compiler: 'javascript',
        console: 'inherit',
        require: {
            external: true,
            root: './',
        },
    }).run(transformed, 'deobfuscate.js');

    return deObfuscated;
};

export const deObfuscate = (html: string): string => {
    if (/error/gi.test(html)) {
        throw new Error(
            html.split("'").find((x) => /(((url)? error)|could)/gi.test(x)),
        );
    } else {
        // only match script tag.
        const obfuscatedScripts = html.match(
            /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
        );
        if (!obfuscatedScripts?.length) {
            throw new Error('Cannot download the video!');
        } else {
            return runObfuscatedScript(
                obfuscatedScripts
                    .find((x) => x.length)!
                    .replace(/<(\/)?script( type=".+")?>/g, '')
                    .trim(),
            );
        }
    }
};

export const matchLink = (raw: string): string[] | null => {
    return raw.match(
        // eslint-disable-next-line max-len
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
    );
};

export const matchCustomDownload = (
    provider: string,
    raw: string,
): string[] => {
    const links = matchLink(raw) as string[];
    const urls = raw
        .match(/\/download.php\?token=(.*?)"/gi)
        ?.map(
            (url) =>
                (getProvider(provider) as BaseProvider)
                    .client!.defaults.options.prefixUrl.toString()
                    .slice(0, -1) + url.slice(0, -3),
        );

    if (!urls?.length) return [];
    return [links[0]].concat(urls as string[]);
};

export const deObfuscateSaveFromScript = (scriptContent: string): string => {
    const safeScript =
        'let result = ' + scriptContent.replace(/\/\*js\-response\*\//gi, '');

    const vm = new NodeVM({
        compiler: 'javascript',
        console: 'inherit',
        require: {
            external: true,
            root: './',
        },
    });
    const result = vm.run(safeScript, 'savefrom.js');
    return result;
};
