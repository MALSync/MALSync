# Build outputs, generated files, environment

## Output layout

| Path | Content |
|---|---|
| `dist/webextension/` | Loadable extension: `manifest.json`, `background.js`, `content/*` (incl. `content/proxy/proxy_request.js`), `popup.html`, `settings.html`, `_locales/`, `icons/`, `vendor/` |
| `dist/webextension/chibi/` | `list.json` + `pages/<key>.json` (bundled chibi repository) |
| `dist/adult/chibi/` | Adult chibi repository |
| `dist/malsync.user.js` | Userscript |
| `test/dist/testCode.js`, `chibiDev.js`, `chibiDevProxy.js` | `build:test` bundles for headless tests and the chibi CLI |
| `test/dist/headless/` | Headless test cache |
| `test/dist/chibi-dev/` | Chibi CLI extension, Chrome profile, uBlock Origin Lite |

The userscript build reads `dist/webextension/chibi/list.json`, `dist/adult/chibi/list.json` and the proxy scripts in `dist/webextension/content/proxy/`, so build the extension content first.

## Generated sources (gitignored; never commit)

| File | Generator | Needed by |
|---|---|---|
| `src/chibiScript/ChibiGeneratorTypes.ts` | `npm run build:chibiTypes` | All chibi type-checking (`chibiParamIndices` is imported at runtime by the consumer), `lint:vue`, IDE |
| `src/chibiScript/FUNCTIONS.md` | `npm run build:chibiTypes` | Function reference for page authors and agents |
| `src/utils/quicklinks.json` | `npm run build:webextension:content:build` | Bundles, unit tests |

## Generated but committed by CI only

README page table, `pages.md`, `src/pages-adult/README.md`, `src/pages/list.json` (`build:descriptions`, weekly), and `src/pages/diffUrls.json` (`build:missingPermissions`). Don't commit local regenerations.

## Environment variables

| Variable | Effect |
|---|---|
| `APP_TARGET=firefox` | Firefox build (`build:webextension:firefox`, `assets:firefox`) |
| `ADULT_DEV=true` | Content build emits adult pages into `dist/webextension/chibi` (`content:adult`) |
| `CI_MODE=travis` | Requires `SIMKL_API_ID`, `SIMKL_API_SECRET`, `MANGABAKA_API_ID`, `MANGABAKA_API_SECRET` (`webpackConfig/utils/keys.js`); otherwise built-in keys are used |
| `CI_MODE=dev` | Dev-channel build: "(DEV)" name suffix and a date-based version (`deployDev.yml`) |
| `NO_API=true` | Unit tests skip real tracker API calls |
| `CI=true` | Headless tests: stay headless for single pages, no visible captcha retry, quiet logs |
| `FILES='["path", ...]'` | Headless tests only for pages whose files are listed |
| `LIST_PAGES=true` | Headless test runner only lists the pages it would run |
| `PUPPETEER_SKIP_DOWNLOAD=true` | Skip the Chrome download on install (breaks headless tests and `npm run chibi`) |
