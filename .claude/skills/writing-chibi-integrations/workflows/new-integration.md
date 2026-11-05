# Workflow: add a new site

`src/pages-chibi/AGENTS.md` has the setup commands, the ChibiDev workflow and the conventions. This checklist orders those steps and adds the checks that catch common mistakes.

```
- [ ] 1. Check the rules: not a clone; if a legacy src/pages version exists, rewrite it as chibi from the live site
- [ ] 2. Start the toolchain (content watcher + `npm run chibi -- <site url>`)
- [ ] 3. Survey the site in the chibi browser
- [ ] 4. Pick the closest implementation (examples-index.md + AGENTS.md "Writing a page")
- [ ] 5. Write main.ts + style.less; register in pages.ts
- [ ] 6. Iterate with ChibiDev.exec / runPage until values and errors are clean
- [ ] 7. Write tests.json from runPage().expected and verify every value by eye
- [ ] 8. CI=true npm run test:headless "<title>"; npm run lint:ci
```

## 3. Survey

Use `navigate_page`, `take_snapshot` and `evaluate_script` on a sync (episode/chapter) page and an overview page. For each, find:
- the title, a stable series ID (it must be identical on both page types), the episode/chapter number, and absolute overview and next-episode URLs;
- whether it is an SPA (URL changes without reload, stale DOM after navigation);
- embedded data (`ld+json`, framework state, JSON responses). If the data only exists in XHR/fetch responses, use `features.requestProxy` (see `reference/page-options.md`);
- every mirror domain (`urls.match`), and player iframes (`urls.player`);
- for manga, the reader modes (AGENTS.md `readerConfig` rules).

## 5. Write

- Share logic through helpers called with `.exec(helper)`, never `helper($c)` (AGENTS.md conventions).
- Before using a function, check its input type and whether its parameters are `ChibiParam` in `FUNCTIONS.md`. Plain `ChibiJson` parameters (e.g. `if`, `and`, `fn`) take a finished chain; `string`/`number` literals don't accept chains (`reference/execution-semantics.md`).
- Guard every optional element with `.ifNotReturn()`. Remember that `null` silently becomes `0`/`"null"` downstream.
- Pick the `ready` pattern from `reference/lifecycle-internals.md`. Add readiness hooks only for the cases AGENTS.md lists.
- Register the page in `src/pages-chibi/pages.ts` (adult sites: `src/pages-adult/pages.ts`).

## 6. Iterate (feedback loop)

After each save, wait for the watcher, reload the tab, then:
```js
async () => ChibiDev.runPage()
```
Check that `ready: true`, `errors` is empty, and each entry in `values` is right. Probe single expressions with `ChibiDev.exec(...)`. Repeat on at least one sync URL, one overview URL, a first/last episode, and after an SPA navigation.

## 7–8. Tests and checks

Copy `expected` from `runPage()` into `tests.json` and correct anything wrong by hand. The harness compares `image` strictly, so it must be present exactly when the page has `getImage` (`reference/headless-tests.md`). Run the headless test and `npm run lint:ci`. If the site blocks headless browsers, commit anyway and say so in the PR (AGENTS.md). Don't commit generated lists (README, pages.md).
