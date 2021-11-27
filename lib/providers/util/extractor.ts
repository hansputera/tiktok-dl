import {getProvider} from '..';
import type {BaseProvider} from '../baseProvider';

import {NodeVM} from 'vm2';

export const deObfuscate = (html: string): string => {
  if (/error/gi.test(html)) {
    throw new Error(html.split('\'')
        .find((x) => /(((url)? error)|could)/gi.test(x)),
    );
  } else {
    // only match script tag
    const obfuscatedScripts = html
        .match(/<script[\s\S]*?>[\s\S]*?<\/script>/gi);
    if (!obfuscatedScripts?.length) {
      throw new Error(
          'Cannot download the video!',
      );
    } else {
      const transformed = obfuscatedScripts[0]
          .replace(/<(\/)?script( type=".+")?>/g, '').trim().replace('eval', '')
          .replace(/\(function(.)?\(h/gi, 'module.exports = (function (h');
      const deObfuscated = new NodeVM({
        'compiler': 'javascript',
        'console': 'inherit',
        'require': {
          'external': true,
          'root': './',
        },
      }).run(transformed, 'deobfuscate.js');
      return deObfuscated;
    }
  }
};


export const matchLink = (raw: string): string[] | null => {
  // eslint-disable-next-line max-len
  return raw.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);
};

export const matchCustomDownload =
(provider: string, raw: string): string[] => {
  const links = matchLink(raw) as string[];
  const urls = raw.match(/\/download.php\?token=(.*?)"/gi)
      ?.map((url) => (getProvider(provider) as BaseProvider).client.
          defaults.options.prefixUrl.slice(0, -1)+
      url.slice(0, -3));

  return [links[0]].concat(urls as string[]);
};

export const deObfuscateSaveFromScript = (scriptContent: string): string => {
  const safeScript = 'let result;' +
  scriptContent.replace(/\/\*js\-response\*\//gi, '')
      .replace(/eval\(a\)/gi, 'return a')
      .replace(/\[\]\["filter"\]\["constructor"\]\(b\)\.call\(a\);/gi, `
        if (b.includes('showResult')) {
          result = b;
          return;
        } else []['filter']['constructor'](b).call(a);`) +
         'module.exports = result;';
  const vm = new NodeVM({
    'compiler': 'javascript',
    'console': 'inherit',
    'require': {
      'external': true,
      'root': './',
    },
  });
  const result = vm.run(safeScript, 'savefrom.js');
  return result;
};
