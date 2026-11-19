# Workflow: review a chibi PR

Check the AGENTS.md rules first, then the runtime pitfalls that type-checking can't catch.

```
- [ ] 1. Contribution rules (AGENTS.md "Rules for contributions")
- [ ] 2. Registration and files
- [ ] 3. Contracts
- [ ] 4. Runtime pitfalls
- [ ] 5. Lifecycle
- [ ] 6. Tests
```

## 1. Contribution rules
No clone or fake site; no new or edited legacy `src/pages` code; no `src/chibiScript` changes for one page; no committed generated lists (README table, `pages.md`, `src/pages/list.json`).

## 2. Registration and files
- `main.ts`, `style.less` (starts with `@import './../pages';`, themed to the site) and `tests.json` are next to each other.
- The page is imported and listed in `src/pages-chibi/pages.ts` (or `src/pages-adult/pages.ts`).
- `urls.match` covers every mirror, `domain` is the main origin, and the `search` template uses a placeholder.

## 3. Contracts
- `getIdentifier` is identical for sync and overview pages of the same series and is stable across episodes (URL parts, not titles).
- `getOverviewUrl`, `nextEpUrl` and `list.elementUrl` return absolute URLs.
- `getEpisode`/`elementEp` return numbers.
- `getMalUrl` respects `provider()`, or uses `providerUrlUtility`.

## 4. Runtime pitfalls (`reference/execution-semantics.md`)
- Optional lookups are guarded with `ifNotReturn()`; no `.string()`/`.number()` applied to possibly-`null` values.
- `regex()` is used only where a match is guaranteed, or guarded by `matches()`.
- Helpers are called via `.exec(helper)`, not `helper($c)`.
- No build-time JS that expects runtime values (`document`, `window`, `Date`, conditionals on page data).
- `ifNotReturn` inside `coalesce`/`if` branches is wrapped in `fn(...)` when the hook should continue.
- Sync-hook `and`/`or` results are not assumed to be booleans when it matters.
- No Promise-returning functions in sync/overview/list hooks.

## 5. Lifecycle (`reference/lifecycle-internals.md`)
- `ready` always reaches `trigger()`; SPAs re-trigger with `detectURLChanges` or `detectChanges`.
- Readiness hooks exist only for the cases AGENTS.md allows, and call `trigger()`.
- `listChange` only for lists that change without navigation.
- Manga `readerConfig` follows the AGENTS.md mode-testing rules.

## 6. Tests (`reference/headless-tests.md`)
- At least one sync and one overview case.
- `image` is present exactly when `getImage` exists, and `uiSelector` is present when the page injects UI on that page type.
- Values look plausible (not `0`, `"null"`, relative URLs).
- A headless failure is acceptable only with a stated reason (bot protection, geo-block).
