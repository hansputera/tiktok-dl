## How to download video from 'streamUrl' or 'downloadUrl' ?

Usually, you should get `403 Forbidden` response because you're getting blocked by Akamai.

How to bypass it? Set `Referer` in your http header request with requested url as a value.

**Example:**
```ts
import got from 'got';
import fs from 'node:fs'; 

const file = fs.createWriteStream('./videoname.mp4');

const stream = got.stream('https://videosite.com', {
    'headers': {
        'Referer': 'https://videosite.com'
    }
});

file.pipe(stream);
```