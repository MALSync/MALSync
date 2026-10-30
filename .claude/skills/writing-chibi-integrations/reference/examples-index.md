# Implementations by pattern

AGENTS.md names three starting points (`Miruro`, `AsuraScans`, `Crunchyroll`). This table adds more patterns. All paths are `src/pages-chibi/implementations/<Name>/main.ts`. Pick by site shape, then confirm the pattern is still there, since pages change.

| Pattern | Implementation | Look at |
|---|---|---|
| Anime SPA with readiness hooks, player iframes | `Miruro` | `detectURLChanges`, `syncIsReady`/`overviewIsReady` with `waitUntilTrue`, `urls.player`, `providerUrlUtility` |
| Manga with reader progress and chapter list | `AsuraScans` | `readerConfig`, `list`, `this()` reuse, `detectURLChanges` |
| Data from XHR responses / globals | `Crunchyroll` | `features.requestProxy` + `requestProxy()`, `debounce`, global variables, `.exec()` helpers |
| Classic static manga site | `toonily` | URL-based `and(...)` detection, `ifNotReturn` chains, `this()` reuse, list, `domReady` |
| Reader with several modes | `Chikari` | One `readerConfig` per mode with `condition`, `coalesce`, `arrayFind` |
| "N / M" reader counter, volumes | `mangaLib` | `readerConfig` from a footer counter, `getVolume`, disabled-next detection via `getComputedStyle`, readiness hooks that re-trigger, domain array |
| Change detection without URL routing | `gojo` | `detectChanges` on URL + title in `ready`, `'<identifier>'` URL templates, `urlParam` in `elementEp` |
| Dynamic / paginated chapter list | `WeebCentral`, `AniXL` | `listChange` with `detectChanges`; `target()` inside `coalesce` |
| Self-hosted servers on user domains | `Jellyfin`, `Plex` | `features.customDomains`, `minimumVersion` |
| Late-rendering content | `animeLib`, `ranobeLib` | Readiness hooks with `waitUntilTrue` |

List all implementations with `ls src/pages-chibi/implementations`. Don't use `src/pages/` (legacy) as a reference (AGENTS.md).
