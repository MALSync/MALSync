# npm scripts

Source of truth: `package.json` → `scripts`.

## Contents
- Build
- Watch / dev
- Generators and maintenance
- Lint
- Test
- Package / release

## Build

| Script | Does |
|---|---|
| `build` / `build:win` | Clean `dist`, then `build:webextension` + `build:userscript` |
| `build:webextension` | content + background + assets |
| `build:webextension:firefox` | Same, with `APP_TARGET=firefox` |
| `build:webextension:content` | `build:chibiTypes` + content pre-build + webpack content bundle (incl. `chibi/list.json`, `chibi/pages/*.json`, `dist/adult/chibi/`, `content/proxy/*`) |
| `build:webextension:content:build` | Pre-build only: writes `src/utils/quicklinks.json` |
| `build:webextension:background` | Service worker bundle |
| `build:webextension:assets` (alias `assets`; Firefox: `assets:firefox`) | Manifest, locales, icons, vendor files |
| `build:userscript` | Content pre-build + userscript bundle `dist/malsync.user.js` |
| `build:test` | `test/dist/testCode.js`, `chibiDev.js`, `chibiDevProxy.js` |
| `clean` / `clean:win` | Remove `dist` |

## Watch / dev

| Script | Does |
|---|---|
| `dev:webextension:content` (alias `content`) | Watch the content bundle |
| `content:adult` | Content watcher with `ADULT_DEV=true` (adult pages into `dist/webextension/chibi`) |
| `dev:webextension:background` (alias `background`) | Watch the service worker |
| `dev:userscript` | Watch the userscript |
| `chibi` | Chibi dev Chrome: `npm run chibi -- [url] [--port N]` |

`dev:webextension:userscript` calls a non-existent `dev:webextension` script, so it fails. Run the watchers separately.

## Generators and maintenance

| Script | Does |
|---|---|
| `build:chibiTypes` | Writes `src/chibiScript/ChibiGeneratorTypes.ts` and `src/chibiScript/FUNCTIONS.md` |
| `build:descriptions` | Writes the README page table, `pages.md`, `src/pages-adult/README.md`, `src/pages/list.json` (CI runs it weekly as an auto-PR) |
| `build:missingPermissions` | Downloads the latest release into `dist/lastExtension` and writes `src/pages/diffUrls.json` (URLs added since that release) |
| `build:autoUrls` | Fetches live sites to refresh rotating player/site domains, then `build:missingPermissions`. Takes `--list` or a task name; CI runs it daily |
| `build:pruneDeadDomains` | DNS-checks domains in match patterns/URLs and removes NXDOMAIN entries from the sources; `--dry` only reports |

## Lint

| Script | Does |
|---|---|
| `lint:ci` | `lint:less:ci` + `lint:script:ci` + `lint:vue` (what CI runs) |
| `lint:script` / `:ci` / `:fix` | ESLint (all / `--quiet` / `--fix`) |
| `lint:less` / `:ci` / `:fix` | Stylelint on `src/**/*.{css,less,vue}` |
| `lint:vue` | `vue-tsc --noEmit` |
| `lint:fix` | Script + less autofix |

## Test

| Script | Does |
|---|---|
| `test` | `test:ts` + `test:headless` |
| `test:ts` | ts-mocha on `test/src/**/*.test.ts` |
| `test:ts:ci` | Same with `NO_API=true` and `--exit` |
| `test:headless [title]` | `build:test` + `node test/headless/test.js [title]` |

## Package / release (maintainers; need secrets)

`package`, `package:webextension`, `package:firefox` (`SIGN_KEY`/`SIGN_SECRET`), `package:chrome` (Chrome Web Store OAuth variables). Don't run these unless asked.
