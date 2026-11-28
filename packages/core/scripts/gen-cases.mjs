import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const fixtures = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');
const urls = JSON.parse(readFileSync(join(fixtures, 'urls.json'), 'utf8'));
const httpDir = join(fixtures, 'http');
const indexFile = join(httpDir, 'index.jsonl');
const index = existsSync(indexFile)
    ? readFileSync(indexFile, 'utf8')
          .split('\n')
          .filter(Boolean)
          .map((line) => JSON.parse(line))
    : [];

const fixtureBody = (predicate) => {
    const entry = index.find(predicate);
    if (!entry) return undefined;
    return JSON.parse(readFileSync(join(httpDir, entry.file), 'utf8')).body;
};

const USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const byPath = (fragment) => (entry) => entry.url.includes(fragment);

const bodies = {
    snaptik: fixtureBody(byPath('/abc2.php')),
    tikmate: fixtureBody(byPath('/abc.php')),
    musicalydown: fixtureBody((entry) => entry.url.endsWith('/download')),
    ttdownloader: fixtureBody(byPath('/search')),
    tikdown: fixtureBody(byPath('/index.php?url=')),
    savetik: fixtureBody(byPath('/api/action')),
    downtik: fixtureBody(byPath('/action.php')),
    native: fixtureBody(byPath('/video/')),
    fasttoksave: fixtureBody(byPath('/wp-json/tiktok-downloader/v1/fetch')),
    savefrom: fixtureBody(byPath('/savefrom.php')),
};

const synthetic = {
    snaptik: '<html>error</html>',
    tikmate: '<html>error</html>',
    musicalydown:
        '<img src="https://cdn.example.com/0.jpg"><a href="https://muscdn.example.com/images/v.mp4">v</a>',
    ttdownloader:
        '<a href="https://cdn.example.com/music.mp3">m</a><a href="https://cdn.example.com/video.mp4">v</a><a href="https://snaptik.fans">s</a>',
    tikdown: 'video.mp4',
    savetik: JSON.stringify({
        downloadUrl: 'https://cdn.example.com/v.mp4',
        hdDownloadUrl: 'https://cdn.example.com/hd.mp4',
        postinfo: {
            media_title: 'title',
            unique_id: 'user',
            uid: '42',
            username: 'nick',
            avatar_url: 'https://cdn.example.com/a.jpg',
        },
        duration: 5,
        stats: {shareCount: 1, playCount: 2, commentCount: 3},
        items: ['https://cdn.example.com/s1.jpg'],
    }),
    downtik:
        '<a href="/download.php?token=abcdef">a</a><a href="https://cdn.example.com/t.jpg">t</a>',
    native: `<html><script id="SIGI_STATE" type="application/json">window['SIGI_STATE']={"ItemModule":{"1":{"id":"1","video":{"playAddr":"https://cdn.example.com/p.mp4","downloadAddr":"https://cdn.example.com/d.mp4","cover":"https://cdn.example.com/c.jpg","duration":12},"music":{"playUrl":"https://cdn.example.com/m.mp3","title":"m","authorName":"a","id":"2","coverLarge":"https://cdn.example.com/mc.jpg","album":"al","duration":9},"author":"user","authorId":"42","avatarThumb":"https://cdn.example.com/av.jpg","nickname":"nick","desc":"caption","stats":{"playCount":1,"shareCount":2,"commentCount":3,"diggCount":4},"createTime":1234567890}}};window.x=1</script><script id="__LOADABLE_REQUIRED_CHUNKS__" type="application/json">[]</script></html>`,
    fasttoksave:
        '{"code":1,"msg":"ok","data":{"author":{"nickname":"n","unique_id":"u"},"comment_count":1,"play_count":2,"cover":"https://cdn.example.com/c.jpg","play":"https://cdn.example.com/p.mp4","music_info":{"author":"a","cover":"https://cdn.example.com/mc.jpg","title":"m"},"wmplay":"https://cdn.example.com/w.mp4","title":"t","duration":3}}',
    savefrom: '({})',
};

const withBody = (name) => bodies[name] ?? synthetic[name];

const cases = [];
const seen = new Set();
const add = (fn, args) => {
    const key = `${fn}\u0000${JSON.stringify(args)}`;
    if (seen.has(key)) return;
    seen.add(key);
    cases.push({fn, args});
};

for (const name of [
    'snaptik',
    'tikmate',
    'musicalydown',
    'ttdownloader',
    'tikdown',
    'savetik',
    'downtik',
    'native',
    'fasttoksave',
    'savefrom',
]) {
    const fn = `${name}Fetch`;
    if (name === 'native') {
        add(fn, [urls.video, {'user-agent': USER_AGENT}]);
        add(fn, [urls.invalid, {'user-agent': USER_AGENT}]);
    } else {
        add(fn, [urls.video]);
        add(fn, [urls.invalid]);
    }
}

for (const name of [
    'snaptik',
    'tikmate',
    'musicalydown',
    'ttdownloader',
    'tikdown',
    'savetik',
    'downtik',
    'native',
    'fasttoksave',
    'savefrom',
]) {
    const body = withBody(name);
    if (name === 'musicalydown') {
        add('musicalydownExtract', [
            JSON.stringify({html: synthetic.musicalydown, headers: {}}),
        ]);
    } else if (name === 'snaptik') {
        add('snaptikExtract', ["(function(h){return 'no links'}(''))"]);
    } else if (name === 'tikdown') {
        add('tikdownExtract', [body, 'https://tikdown.org']);
    } else if (name === 'downtik') {
        add('downtikExtract', [body, 'https://downtik.io']);
    } else {
        add(`${name}Extract`, [body]);
    }
}

add('deObfuscate', [withBody('tikmate')]);
add('deObfuscateSaveFromScript', ['({})']);
add('deObfuscate', ['<html>error</html>']);
add('deObfuscate', ['<html></html>']);
add('deObfuscate', [
    "<script>(function(h){return 'no links'}(''))</script>",
]);

const noLinksScript = "(function(h){return 'no links'}(''))";
const tikmateHtml = withBody('tikmate');
const tikmateScriptMatch = tikmateHtml.match(
    /<script[\s\S]*?>[\s\S]*?<\/script>/i,
);
const tikmateScript = tikmateScriptMatch
    ? tikmateScriptMatch[0]
          .replace(/<(\/)?script( type=".+")?>/g, '')
          .trim()
    : noLinksScript;
add('runObfuscatedScript', [tikmateScript]);
add('runObfuscatedReplaceEvalScript', [tikmateScript]);
add('runObfuscatedScript', [noLinksScript]);
add('runObfuscatedReplaceEvalScript', [noLinksScript]);
add('tikmateExtract', [withBody('tikmate')]);
add('tikmateExtract', [
    "<script>(function(h){return 'no links'}(''))</script>",
]);

const traps = [
    'İstanbul https://example.com/I\u0307',
    'https://exаmple.com',
    'x\u00A0https://example.com',
    'https://example.com/a b',
    '\u{1F600}https://example.com',
    'https://example.com/\u212A',
    '\uFEFFhttps://example.com',
];
for (const trap of traps) add('matchLink', [trap]);

const capturedBodies = [];
for (const entry of index) {
    const body = JSON.parse(
        readFileSync(join(httpDir, entry.file), 'utf8'),
    ).body;
    if (typeof body === 'string' && body.length && !capturedBodies.includes(body)) {
        capturedBodies.push(body);
    }
}
for (const body of capturedBodies.slice(0, 12)) add('matchLink', [body]);

add('matchTikTokData', [withBody('native')]);
add('matchTikTokData', [
    "<script>window['SIGI_STATE']={\n\"ItemModule\":{}}</script><script id=\"__LOADABLE_REQUIRED_CHUNKS__\" type=\"application/json\">[]</script>",
]);
add('matchCustomDownload', ['https://downtik.io', withBody('downtik')]);
add('extractMusicalyDownImages', [withBody('musicalydown')]);

writeFileSync(
    join(fixtures, 'cases.input.jsonl'),
    cases.map((entry) => JSON.stringify(entry)).join('\n') + '\n',
);
console.log(`${cases.length} cases -> fixtures/cases.input.jsonl`);
