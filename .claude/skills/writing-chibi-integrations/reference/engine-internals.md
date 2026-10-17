# Engine internals

How chibi pages get from source to the browser. Engine changes are maintainer decisions (AGENTS.md); this file explains the existing behaviour.

## Contents
- Build pipeline
- Generator
- FUNCTIONS.md and typings generation
- Loader and remote updates
- Page matching and the proxy
- Adult pages

## Build pipeline

| Stage | Code | Output |
|---|---|---|
| Author | `src/pages-chibi/implementations/<Name>/main.ts`, registered in `src/pages-chibi/pages.ts` | `PageInterface` objects |
| List | `src/pages-chibi/builder/chibiList.ts` (webpack entry `chibi-list`) | `dist/webextension/chibi/list.json`: key, name, type, domain, languages, urls, search, database, features, minimumVersion, version |
| Pages | `src/pages-chibi/builder/chibiPages.ts` (entry `chibi-pages`) | `dist/webextension/chibi/pages/<key>.json`: every hook (and each `readerConfig` callback) invoked once with `$c` |
| Version | `builder/chibiHelper.ts` | `version.hash` from the page's normalized source text, plus a build `timestamp` |
| Runtime | `src/pages-chibi/ChibiProxy.ts` + `src/chibiScript/ChibiConsumer.ts` | A legacy-shaped `pageInterface` driven by `src/pages-sync/syncPage.ts` |

The extension content script prefers a chibi page and falls back to legacy `src/pages`. The userscript (`src/index.ts`) and test bundle (`test/index.ts`) call `Chibi()` and fall back on `NotFoundError`.

## Generator (`src/chibiScript/ChibiGenerator.ts`)

- One method per entry in the functions and utilities registries. Each function call returns a new immutable builder with one more `[name, ...args]` step. Utilities (`utilities/*Utilities.ts`, e.g. `exec`, `providerUrlUtility`, `coalesceFn`, `slugify`) run at build time and expand into ordinary steps.
- Function-typed arguments are called with `$c` immediately, so callbacks become JSON.
- `waitUntilTrue`, `detectChanges`, `detectURLChanges` and `debounce` get a random interval key injected at a fixed argument index.

## FUNCTIONS.md and typings generation

`npm run build:chibiTypes` (also run by `build:webextension:content` and `dev:webextension:content`) runs `webpackConfig/webextension.content.generateChibi.js`:
- It globs `src/chibiScript/functions/**/*Functions.ts` and `src/chibiScript/utilities/**/*Utilities.ts`.
- It writes `src/chibiScript/ChibiGeneratorTypes.ts`: typed builder interfaces (input-type mismatches become compile errors) plus `chibiParamIndices`, which the consumer uses to resolve `ChibiParam` arguments.
- It writes `src/chibiScript/FUNCTIONS.md`: one line per function from the JSDoc (first description line, `@input`, up to two `@example`s).
- The build fails if a function body uses `ctx.run(` without also handling `ctx.runAsync(`, because functions must work in sync and async context. It also fails if a utility parameter with a default value lacks a type.

Both outputs are gitignored. If a stale `ChibiGeneratorTypes.ts` lacks `chibiParamIndices`, imports fail, so regenerate.

## Loader and remote updates (`src/pages-chibi/loader/ChibiListRepository.ts`)

- Repositories:
  - Extension: bundled `chrome.runtime.getURL('chibi')`, then `https://chibi.malsync.moe/config`, then the user's `chibiRepos` setting.
  - Userscript: `…/config` and `…/adult`.
- Merge: for each key, a later collection's entry replaces the earlier one only when the hash differs and its timestamp is newer. Pages whose `minimumVersion` is newer than the running extension are skipped.
- Cache: storage key `chibiPages/<extension version>`, used only by `getInstance(true)` (settings). `Chibi()` always refetches.
- `getPage(key)` fetches `<root>/pages/<key>.json?version=<hash>`.
- `getPermissions()` returns each page's `urls.match` (plus custom domains with `features.customDomains`), `urls.player` entries, and a request-proxy entry with `features.requestProxy`.
- `.github/workflows/pages-deploy.yml` publishes `dist/webextension/chibi` and `dist/adult/chibi` to chibi.malsync.moe from master, which is what makes page fixes ship without a release.

## Page matching and the proxy (`src/pages-chibi/ChibiProxy.ts`)

`Chibi()`:
1. Loads the list.
2. Picks pages whose `urls.match` matches `location.href`. If none match, it falls back to the user's `customDomains`. Zero matches → `NotFoundError`; several → logs an error and uses the first.
3. Fetches the page JSON, injects the request proxy in the userscript if `features.requestProxy` is set, and returns a legacy-shaped `pageInterface`. Each method creates a fresh `ChibiConsumer` with context variables (`reference/lifecycle-internals.md`).

Name mapping to the legacy interface: `sync.uiInjection` → `sync.uiSelector`, `overview.uiInjection` → `overview.uiSelector`, `list.*` → `overview.list.*`, `sync.isSyncPage` → `isSyncPage`, `overview.isOverviewPage` → `isOverviewPage`.

## Adult pages

`src/pages-adult/` has the same structure (`implementations/`, `pages.ts`, `builder/`). The content build emits them to `dist/adult/chibi/`, and they are published as the `…/adult` repository that users add in settings. `npm run content:adult` (`ADULT_DEV=true`) builds them into `dist/webextension/chibi` instead, so they can be developed with the normal tooling.
