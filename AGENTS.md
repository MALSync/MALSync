# MAL-Sync

Browser extension (Chrome/Firefox, MV3) and userscript. It syncs anime/manga progress from streaming and reading sites to MyAnimeList, AniList, Kitsu, Simkl, Shikimori and MangaBaka. Stack: TypeScript, Vue 3, jQuery, webpack. Requires node >= 24 and npm >= 11 (`engine-strict`).

Folder guides with more detail: `src/pages-chibi/AGENTS.md` (site integrations; authoritative) and `src/pages/AGENTS.md` (legacy pages, closed to contributions).

## Commands

```sh
npm ci
npm run build                     # Windows: npm run build:win (build uses rm -rf)
npm run dev:webextension:content  # watch content scripts + chibi pages (alias: content)
npm run dev:webextension:background
npm run dev:userscript
npm run build:test                # browser bundles in test/dist for headless tests and the chibi CLI
npm run chibi -- [url]            # dev Chrome with the chibi runtime (see src/pages-chibi/AGENTS.md)
npm run lint:ci                   # stylelint + eslint --quiet + vue-tsc (what CI runs)
npm run test:ts                   # unit tests (mocha); test:ts:ci sets NO_API=true
npx ts-mocha -p tsconfig.node.json test/src/utils/slug.test.ts --require test/_env_injection.ts   # one file
CI=true npm run test:headless "<tests.json title>"   # one page test, headless
```

Load the extension for manual testing: `chrome://extensions` → Developer mode → Load unpacked → `dist/webextension`.

Generated and gitignored, needed before type-checking/linting/tests: `src/chibiScript/ChibiGeneratorTypes.ts` and `src/chibiScript/FUNCTIONS.md` (`npm run build:chibiTypes`), and `src/utils/quicklinks.json` (`npm run build:webextension:content:build`).

## Architecture

- **Entry points:** `src/index-webextension/` holds the extension scripts: `content.ts` (supported sites), `serviceworker.ts`, per-tracker page scripts (myanimelist, anilist, kitsu, simkl, mangabaka), OAuth callbacks and `pwa.ts`. `src/index.ts` is the userscript.
- **Platform layer:** `src/api/` abstracts webextension vs userscript (storage, requests, settings). Code uses the injected globals declared in `globals.d.ts`: `api`, `utils` (`src/utils/general.ts`), `con` (logger), and `j` (`j.$` = jQuery, `j.html` = sanitizer).
- **Trackers:** `src/_provider/<Tracker>/` implement `singleAbstract.ts` (one entry), `listAbstract.ts` (user lists) and `metaOverviewAbstract.ts` (metadata). Use the factories (`singleFactory`, `listFactory`, `metaDataFactory`, `searchFactory`), which pick the implementation from the user's sync mode.
- **Site integrations:**
  - `src/pages-chibi/`: ChibiScript pages, compiled to JSON at build time and interpreted at runtime. These are the only kind of page accepted.
  - `src/pages-adult/`: chibi pages published as a separate repository.
  - `src/pages/`: legacy imperative pages, closed to contributions.
  - `src/pages-sync/syncPage.ts`: the shared runtime that drives every page (detection, tracker lookup, UI, progress updates).
  - `src/pages-chibi/loader/ChibiListRepository.ts` merges the bundled pages, the remote config at `https://chibi.malsync.moe/config` and the user's `chibiRepos` setting, so page fixes ship without an extension release.
- **Other:** `src/background/` (service-worker logic: list sync, release progress, notifications, custom domains), `src/_minimal/` + `src/popup.ts` (the "miniMAL" Vue popup/settings), `src/floatbutton/`.

## Conventions

- ESLint flat config in `config/eslint/` (airbnb-based, prettier, cspell spell-check, `no-unsanitized`, custom `jquery-unsafe-malsync`). Insert HTML through `j.html(...)`.
- UI strings are i18n keys in `assets/_locales/<lang>/messages.json`; translations come from Weblate.
- Don't commit generated lists: `README.md` page table, `pages.md`, `src/pages-adult/README.md`, `src/pages/list.json`. CI regenerates them (`build:descriptions`).
