# Workflow: development loop

Do one full build first (`workflows/first-time-setup.md`). Then run only the watchers you need, each in its own terminal or as a background process.

| Working on | Watcher |
|---|---|
| Content scripts, chibi pages, sync UI, tracker page scripts, popup/miniMAL | `npm run dev:webextension:content` (alias `content`) |
| Adult chibi pages (`src/pages-adult`) | `npm run content:adult` (builds them into `dist/webextension/chibi` instead of the normal pages) |
| Service worker (`src/background`, `serviceworker.ts`) | `npm run dev:webextension:background` (alias `background`) |
| Userscript | `npm run dev:userscript` |

`dev:webextension:content` regenerates the chibi typings, `FUNCTIONS.md` and `quicklinks.json` once at start, then watches.

## Chibi dev browser

For site integrations, follow the Workflow section of `src/pages-chibi/AGENTS.md`. The mechanics:

```bash
npm run build:test                  # once, and after runtime changes: test/dist/chibiDev.js
npm run dev:webextension:content    # keep running
npm run chibi -- <url> [--port 9222]
```
- The CLI refuses to start without `dist/webextension/chibi/list.json` or `test/dist/chibiDev.js`.
- It builds a dev extension in `test/dist/chibi-dev/extension` and launches puppeteer's Chrome with remote debugging on port 9222. That port is what `.mcp.json`'s `chrome-devtools` server connects to, so don't change `--port` unless you also change `.mcp.json`.
- It keeps the profile in `test/dist/chibi-dev/profile`, so logins and Cloudflare clearance persist.
- It downloads uBlock Origin Lite to `test/dist/chibi-dev/ublock-origin-lite` (delete the folder to update it).
- It re-syncs page data about once per second when the content build changes; reload the tab to pick it up. If `test/dist/chibiDev.js` changes, restart the CLI.
- If Chrome exits within ~5 s of starting, another chibi Chrome is probably already running on that profile.

## Rebuilds the watchers don't cover

| You changed | Run |
|---|---|
| Manifest inputs: legacy page URLs, permissions config, `assets/_locales`, icons | `npm run assets` (Firefox: `npm run assets:firefox`), then reload the extension |
| ChibiScript functions/utilities | `npm run build:chibiTypes` (or restart the content watcher) |
| `test/index.ts`, `test/chibiDev/runtime.ts` | `npm run build:test` |

Generated lists (README table, `pages.md`) are rebuilt weekly by CI (`descriptions.yml`); don't regenerate and commit them. Rotating player/site domains are refreshed daily by `autoUrls.yml` (`npm run build:autoUrls`).

## Checking your change

- Site integration: `ChibiDev.runPage()`, then `CI=true npm run test:headless "<title>"` (`reference/testing.md`).
- Engine/utils/provider logic: the matching unit test file.
- Before committing: `workflows/ci-parity.md`.
