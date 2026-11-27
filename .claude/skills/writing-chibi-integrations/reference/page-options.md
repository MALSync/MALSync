# Optional page members

`PageInterface` members that AGENTS.md mentions only briefly or not at all. Their JSDoc in `src/pages-chibi/pageInterface.ts` is the source of truth.

## features.requestProxy

For sites whose data only exists in XHR/fetch responses.
- The extension registers `content/proxy/proxy_request.js` (built from `src/pages-chibi/proxies/requestProxy.ts`) for the page's `urls.match`, listed as an optional "(chibi request proxy)" permission. In the userscript, `Chibi()` injects the script tag itself.
- The proxy hooks fetch/XHR JSON responses into `malsync-xhr` events and queues them until the page calls `requestProxy()` (see `FUNCTIONS.md`).
- Reference implementation: `Crunchyroll` (`requestProxy()` + `debounce` + global variables).

## features.customDomains

For self-hosted software on arbitrary domains (media servers). It lets users map their own domain to the page in settings (`customDomains`). When no `urls.match` matches, `Chibi()` falls back to a matching custom domain, and the domains are added to the page's permissions. Examples: `Jellyfin`, `Plex`.

## urls.player

`{ [playerName]: matchPatterns[] }` for video player iframes that MAL-Sync should track for this page. They become optional host permissions labelled `<Page>[<player>] (chibi)`. Example: `Miruro`. Some player domains rotate; `npm run build:autoUrls` refreshes the known ones.

## computedType

`($c) => 'anime' | 'manga' | 'novel'`, for sites that host several media types. It runs synchronously right before `handlePage()` on every trigger. `'novel'` is treated as manga with the novel flag set. The static `type` remains the default.

## sync.readerConfig

Manga reading progress. An array of `{ condition?, current, total }`, each a `($c) => ChibiJson` (number/boolean), compiled like any other hook. The first config whose `condition` is truthy is used. Follow the AGENTS.md readerConfig rules (mode testing, `countAbove()` only as a scroll fallback). Examples: `Chikari` (per-mode configs), `mangaLib` ("N / M" footer), `WeebCentral` (condition + `countAbove` fallback).

## minimumVersion

The extension version a page needs. Installed extensions fetch page JSON from the remote config. If a page uses a ChibiScript function or feature added in a later release, older extensions would fail with `Unknown function`. The loader skips pages whose `minimumVersion` is newer than the running extension. Set it only when relying on such additions (examples: `animepahe`, `Plex`, `Jellyfin`).

## getMalUrl

Implement it only when the site exposes tracker IDs or URLs. `providerUrlUtility` (a build-time utility in `FUNCTIONS.md`) builds a provider-aware chain from ID/URL chains for MAL, AniList, Kitsu, etc. Examples: `gojo`, `Miruro`, `Chikari`.

## database

Internal, first-party only. Don't set it.
