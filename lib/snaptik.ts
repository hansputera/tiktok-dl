import { Got } from '.';

interface Extracted {
    error?: string;
}
class Snaptik {
    private client = Got.extend({
        prefixUrl: 'https://snaptik.app/en',
    });

    async fetchDownloadPage(url: string) {
        const response = await this.client.get('./abc.php', {
            searchParams: {
                'url': url,
            }
        });

        return this.extractInfo(response.body);
    }

    private extractInfo(html: string): Extracted {
        if (/error/gi.test(html)) {
            return {
                'error': html.split('\'').find(x => /(((url)? error))|could)/gi.test(x))
            };
        } else {
            // only match script tag
            const obfuscatedScripts = html.match(/<script[\s\S]*?>[\s\S]*?<\/script>/gi);
            if (!obfuscatedScripts?.length) return { error: 'Cannot download the video!' };
            else {
                // remove script tag and trim it
                const cleanedScript = obfuscatedScripts[0].replace(/<(\/)?script( type=".+")?>/g, '').trim();
                console.log(cleanedScript);
                return { 'error': 'asw' };
            }
        }
    }
}

export const snaptik = new Snaptik();