# TikTok Downloader

Lightweight TikTok Downloader using NodeJS.

## Technology
- [Got](https://npmjs.com/got)
- [Ow](https://npmjs.com/ow) `validation`

## Develop
- Clone/fork into a directory you want.
- Install all dependencies correctly (`yarn install` or `npm install`)
- Install vercel cli too with `npm install vercel -g` or `yarn global add vercel`
- Ran `vercel dev` for development (default port is: `3000`)
> Use `vercel --prod` for production use.


## Configuration
This config is required if you want use `/api/search`.

1. Go to https://tiktok.com and login using your account.
2. Open developers tool, and find `Storage` (Firefox) or `Application` (Chrome) and click it.
3. Click `Cookies` and find `sessionid`.
4. Copy `sessionid` value to your clipboard.

**Environment Setup:**
1. Rename `.env.example` to `.env`
2. Fill `SESSION` value with your `sessionid`.

**Environment Setup on Hosting:**
> Tested on [Vercel](https://vercel.com)
1. Go to your project settings.
2. Find `Environment Variables` button and click it.
3. Add environment variable with `SESSION` as the name, and your `sessionid` as a value.

## Endpoints
- **/api/ping:**

Send ping request to [TikTok](https://tiktok.com)

**Query requirements:** -

- **/api/search:**
> `SESSION` needed.

Search trending topic and videos about `x`

**Query requirements:**
- `q`: Keyword you want to search. (eg. `Naruto`)
- `t`: Searching type (`trend` for trending topic or `cards` for videos and user(s) information)

**Example:** `/api/search?q=Boruto&t=cards`

- **/api/download:**

Get tiktok video without watermark!

**Query requirements:**
- `url`: TikTok Video URL. (eg. `https://www.tiktok.com/@vanessaangelnih/video/7006671762352016666`)


## Credits

- [SnapTik](https://snaptik.app) `Non-Watermark Video Source`
- [TikTok](https://tiktok.com) 

Contribution(s) are welcome!