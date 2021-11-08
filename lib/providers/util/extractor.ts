import {getProvider} from '..';
import type {BaseProvider} from '../baseProvider';

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
      // eslint-disable-next-line max-len
      const deObfuscated = eval(obfuscatedScripts[0].replace(/<(\/)?script( type=".+")?>/g, '').trim().replace('eval', ''));
      return deObfuscated;
    }
  }
};


export const matchLink = (raw: string): string[] | null => {
  // eslint-disable-next-line max-len
  return raw.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);
};

export const matchTikmateDownload = (raw: string): string[] => {
  const links = matchLink(raw) as string[];
  const urls = raw.match(/\/download.php\?token=(.*?)"/gi)
      ?.map((url) => (getProvider('tikmate') as BaseProvider).client.
          defaults.options.prefixUrl.slice(0, -1)+
      url.slice(0, -3));

  return [links[0]].concat(urls as string[]);
};
