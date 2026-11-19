# Workflow: fix a broken integration

Most breakages are changed selectors, URL formats or domains.

```
- [ ] 1. Reproduce with the page test (failure label tells you the field)
- [ ] 2. Open the failing URL in the chibi browser and run ChibiDev.runPage()
- [ ] 3. Narrow down with ChibiDev.exec on the failing hook and its sub-chains
- [ ] 4. Fix main.ts (and urls.match/domain if the site moved)
- [ ] 5. Update tests.json only for legitimate site-data changes
- [ ] 6. Re-run runPage and the headless test (clear its cache first); lint
```

## 1. Reproduce

```bash
CI=true npm run test:headless "<tests.json title>"
```
Failure labels: `Sync`, `Title`, `Identifier`, `Image`, `Episode`, `Volume`, `Overview Url`, `Next Episode`, `UI`, `Episode List Empty`, `EP<n>`. The harness caches pages in `test/dist/headless/clear/<title>/`, so delete that folder to test against the live site (`reference/headless-tests.md`).

## 2–3. Locate

`ChibiDev.runPage()` returns `errors` naming the hook and the chibi function that threw, and `ready: false` if `trigger()` never fired. Then probe:
```js
async () => ChibiDev.exec($c.url().this('sync.getEpisode'))
async () => ChibiDev.exec($c.querySelector('.player h1').text())
```
In the regular extension, the same information appears as red `MAL-Sync` console logs.

| Symptom | Likely cause |
|---|---|
| `ready: false` / nothing happens | `ready` never calls `trigger()`; `urls.match` misses a new domain (check `ChibiDev.pages().matching`); `isSyncPage` and `isOverviewPage` both false |
| Works on first load, not after navigation | SPA without `detectURLChanges`/`detectChanges` in `ready`, or stale DOM, which needs a readiness hook (AGENTS.md) |
| Episode `0`/`NaN`, title `"null"` | An upstream step returned `null` and was converted (`reference/execution-semantics.md`) |
| Hook returns early with `null` | `ifNotReturn` in a nested chain ended the hook; wrap the branch in `fn(...)` |
| `and(...)` returns a string/element in a sync hook | Expected: sync `and`/`or` return the last evaluated value; add `.boolean()` if a strict boolean matters |
| Sync and overview don't share progress | `getIdentifier` differs between page types |
| Reading progress never completes | `readerConfig` counts appended next-chapter pages or uses `countAbove` in a paged mode (AGENTS.md readerConfig rules) |
| `Unknown function` on installed extension | Page uses a function newer than the user's extension; set `minimumVersion` (`reference/page-options.md`) |

## 4–6. Fix and verify

Keep fixes minimal and within ChibiScript. For a domain move, update `urls.match`, `domain` and the test URLs. Rerun `runPage()` on several URLs, then the headless test and `npm run lint:ci`.
