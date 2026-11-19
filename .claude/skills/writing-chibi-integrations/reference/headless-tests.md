# Headless page tests: what is compared

AGENTS.md gives the `tests.json` format and how to run tests. This file covers how `test/headless/test.js` evaluates them.

## Discovery and bundling

- `npm run test:headless [title]` = `npm run build:test` (webpack → `test/dist/testCode.js`, `chibiDev.js`, `chibiDevProxy.js`) + `node test/headless/test.js [title]`.
- `test.js` finds every `tests.json` under `src/`. The `title` argument filters on the file's `title` field.
- `testCode.js` compiles the chibi list/pages **from source** and serves them through a stubbed `chrome.runtime.sendMessage`. After a source change, `build:test` is what matters, not `dist/webextension`.

## Comparison rules

| Field | Rule |
|---|---|
| `sync`, `title`, `identifier` | Always compared, strict equality |
| `image` | Always compared strictly. The received value is `undefined` when the page has no `getImage` for that page type, so include `image` exactly when it does |
| `episode` | Sync cases; received value is `parseInt`'d |
| `volume` | Sync cases, only when the expected value is truthy |
| `overviewUrl` | Sync cases; **required**; a leading `www…` subdomain is stripped on both sides |
| `nextEpUrl` | Sync cases; falsy on either side is treated as `''`; `www…` stripped |
| `uiSelector` | Compared whenever the page defines `uiInjection` for that page type (always on overview pages with an overview). Expected is `true` if the injected test UI rendered |
| `epList` | If present, the received list must be non-empty and every expected key must match (subset check). Only produced when `list.elementUrl` exists. Keep a few representative entries |

Failure labels: `Sync`, `Title`, `Identifier`, `Image`, `Episode`, `Volume`, `Overview Url`, `Next Episode`, `UI`, `Episode List Empty`, `EP<n>`.

`runPage().expected` (ChibiDev) produces this format directly. Its `epList` contains every episode, so trim it.

## Caching

The first run stores each page in `test/dist/headless/clear/<title>/<url-path>/` (`index.html` plus `requests/*/data.json`). Later runs replay the cache, block other requests and stub images, so they are fast and offline. Delete the folder to test against the live site again. There is a 100 s timeout per case and up to 3 retries on Cloudflare challenges.

## Flags and environment

- `CI=true` keeps a single-page run headless, disables the visible captcha retry, and (without `FILES`) enables quiet logging.
- `FILES='["path", ...]'` limits the run to pages whose files changed.
- `LIST_PAGES=true` only lists the matching pages (CI uses it to build its matrix).
- CI (`.github/workflows/pages.yml`) checks out the encrypted `MALSync/test_data` cache into `test/dist/headless`, then runs `node test/headless/test.js "<title>"` with `CI=true` per changed page.
