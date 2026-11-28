import {ExtractedInfo} from '../base';
import {deObfuscateSaveFromScript} from './deobfuscate';

export function savefromExtract(html: string): ExtractedInfo {
    const deobfuscated = deObfuscateSaveFromScript(html);
    const json = JSON.parse(
        (deobfuscated.match(/\({(.*)}\)/) as string[])[0].replace(
            /(\(|\))/g,
            '',
        ),
    );
    return {
        video: {
            thumb: json.thumb,
            id: json.id,
            urls: json.url.map((x: {url: string}) => x.url),
            duration: json.meta.duration,
            title: json.meta.title,
        },
    };
}
