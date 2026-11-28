# TikTok Downloader

TikTok video downloader (watermark and no-watermark) built as a Next.js app with a Rust core.

## Stack

- [Turborepo](https://turborepo.org) + Yarn 4 workspaces
- [Next.js 15](https://nextjs.org) (App Router, webpack build) + React 19 + Tailwind CSS 4
- `packages/core`: Rust napi addon (reqwest + QuickJS via rquickjs), loaded by a thin CommonJS
  entry. See [packages/core/README.md](packages/core/README.md).
- Redis for provider rotation and response caching (`ioredis`)

## Layout

```
apps/web                 Next.js app and API routes
packages/core            tiktok-dl-core: Rust addon, JS entry, type declarations, fixtures
packages/config          shared ESLint/Prettier config
```

## Development

Prerequisites:

- Node.js 22 (`node -v`)
- Yarn 4 through Corepack (`corepack enable`, the repo pins `yarn@4.9.3`)
- Rust with `cargo` on `PATH` (`rustup show`), plus a C compiler for QuickJS. The crate's MSRV is
  1.88; any current stable works.

```sh
yarn install
yarn dev
```

`yarn dev` builds the Rust addon for the current platform, then starts Turbo's dev tasks
(`next dev` on port 3000).

Environment (`.env.example`):

```sh
REDIS_URL=redis://localhost:6379
```

Without Redis the home page and `/api/providers` work, but `/api/download` and
`/api/stored-links` fail on the cache connection.

## Build

```sh
yarn build
```

Turbo builds `packages/core` (cargo release, then `libcore_rs.{dylib,so}` is copied to
`core_rs.node`) and then `apps/web`. `yarn start` serves the production build.

## The core package

`packages/core` is a Rust addon plus a 95-line `index.cjs` that builds the ten provider objects
and re-exports the utilities. There is no TypeScript implementation. The public API, crate
layout, fixture replay and the steps for adding a provider are in
[packages/core/README.md](packages/core/README.md).

Behavior is pinned by recorded cases in `packages/core/fixtures/cases.jsonl`; the HTTP responses
those cases replay are in `packages/core/fixtures/http/`. Several providers are broken upstream
(snaptik answers 404, tikdown finds no result link, fasttoksave answers 525, SaveFrom fails); the
port reproduces today's behavior rather than fixing the sites.

## Deployment

### Vercel

The Next.js app deploys as before; the only difference is that the native addon must be compiled
for Vercel's Linux runtime during the build.

- Set **Root Directory** to `apps/web`.
- `apps/web`'s build script runs `packages/core/scripts/build-native.mjs` before `next build`, so
  the addon is compiled with `cargo` on the build machine. Vercel's build image (Amazon Linux
  2023) supports Rust; the build adds roughly 1–3 minutes.
- `apps/web/next.config.ts` sets `outputFileTracingRoot` to the repo root and lists
  `native/core-rs/index.cjs` and `native/core-rs/core_rs.node` in `outputFileTracingIncludes`, so
  the function bundle contains the addon. Verified locally: both files appear in
  `.next/server/app/api/providers/route.js.nft.json`.
- Set `REDIS_URL` in the project environment variables.
- If the build image cannot compile Rust in a future change, build the addon for
  `linux-x64-gnu` elsewhere, commit it as `packages/core/native/core-rs/core_rs.node`, and set
  `CORE_RS_PREBUILT=1` for the build (the script then skips cargo).

The usual Vercel limits apply; the addon is about 11 MB, well under the function bundle limit.

### Docker

The root `Dockerfile` builds the addon in a `rust:1-alpine` stage (musl) and copies it into the
`node:22-alpine` image, then builds the app with `CORE_RS_PREBUILT=1`.

```sh
docker compose up --build
```

The compose file starts Redis and the app on port 3000.

## Endpoints

API documentation: <https://docs.tdl.besecure.eu.org>

## Bugs

Open an issue with the request URL, provider and the error message. Provider-side breakage is
expected for the sites listed above.

## Credits

- [TikTok](https://tiktok.com)
- [SnapTik](https://snaptik.app)
- [Tikmate](https://tikmate.online)
- [SaveFrom](https://id.savefrom.net)
- [TTDownloader](https://ttdownloader.com)
- [Musically Down](https://musicaldown.com)
- [TikDown](https://tikdown.org)
- [DownTik](https://downtik.net)
- [LoveTik](https://lovetik.com)
- [TikTokDownloaderOne](https://tiktokdownloader.one)
- [GetVidTik](https://getvidtiktok.com)

Contributions are welcome.
