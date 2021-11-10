# TikTok Downloader

Video TikTok Downloader using NodeJS with Watermark and Non-Watermark.

## Technology
- [Got](https://npmjs.com/got)
- [Ow](https://npmjs.com/ow) 

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
2. Fill `REDIS_URL` value with your redis database url.
3. Fill `SESSIONS` value with your sessionid, also it support multiple session. So, if you want use multiple session split it using `,`

**Environment Setup on Hosting:**
1. Go to your project settings.
2. Find `Environment Variables` button and click it.
3. Add environment variable with `REDIS_URL` as the name, and fill the value using your redis url.
4. Same like above, add environment variable with `SESSIONS` as the name, and fill the value using your `sessionid`. 

## Endpoints
Available on [Wiki](https://github.com/hansputera/tiktok-dl/wiki/Endpoints)

## Credits + Source

- [TikTok](https://tiktok.com) 
- [SnapTik](https://snaptik.app)
- [Tikmate](https://tikmate.online)
- [SaveFrom](https://id.savefrom.net)
- [TTDownloader](https://ttdownloader.com)
- [Musically Down](https://musicaldown.com)
- [DLTik](https://dltik.com/)
- [TTSave](https://ttsave.app)

Contribution(s) are welcome!
