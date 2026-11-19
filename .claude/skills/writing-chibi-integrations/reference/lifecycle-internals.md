# Lifecycle internals

What `src/pages-chibi/ChibiProxy.ts` (`init`) does with the `lifecycle` hooks. AGENTS.md says when to use each hook; this file explains how they behave.

## Sequence

1. **`setup`** runs once, **synchronously** (async functions throw here). Use it for `addStyle(...)` and other one-time work.
2. **`ready`** runs once with `runAsync`. Each `trigger()` it calls:
   - clears the intervals of the previous readiness consumer and the default readiness poll, then calls `page.reset()`. It does **not** clear intervals started by `ready` itself, so watchers in `ready` keep running;
   - evaluates `isSyncPage`, then (if false) `isOverviewPage`;
   - **sync page:** runs `syncIsReady` if defined, otherwise polls (`utils.waitUntilTrue`) until `sync.getTitle` and `sync.getIdentifier` are both truthy;
   - **overview page:** the same with `overviewIsReady` and the overview getters;
   - **neither:** nothing happens.
3. When the readiness step fires its trigger, `computedType` (if defined) runs, then `page.handlePage()`.
4. **`listChange`** (if defined) runs once at init with `runAsync`. Each of its `trigger()` calls runs `page.handleList()`.

`trigger()` inside a readiness hook is not limited to one call. Every call runs `handlePage()` again (e.g. `mangaLib` re-triggers from `syncIsReady` through `detectChanges`).

## ready patterns

| Site behaviour | Pattern |
|---|---|
| Full page loads | `$c.domReady().trigger().run()` |
| SPA, URL changes | `$c.detectURLChanges($c.trigger().run()).domReady().trigger().run()` |
| URL change isn't a reliable signal (hash/query routing, content swaps) | `$c.domReady().detectChanges($c.url().concat($c.title().run()).run(), $c.trigger().run()).trigger().run()`: watch whatever changes on navigation |
| 404 pages | Guard first, see AGENTS.md (`title().contains(...).ifThen(... .return())`) |

`detectURLChanges(callback, { ignoreQuery?: false, ignoreAnchor?: true })`. `detectChanges(target, callback)` polls `target` every 500 ms and fires when the value changes to something other than `undefined`. `waitUntilTrue`, `detectChanges`, `detectURLChanges` and `debounce` get a hidden interval key from the generator, so never pass that argument.

## Which hooks receive `url`

`url` is set from MAL-Sync's argument for: `isSyncPage`, `isOverviewPage`, sync `getTitle`/`getIdentifier`/`getOverviewUrl`/`getEpisode`/`getVolume`/`nextEpUrl`, and overview `getTitle`/`getIdentifier`. Everywhere else (`getImage`, `uiInjection`, `getMalUrl`, list hooks, lifecycle, `computedType`) `$c.url()` falls back to `location.href`. `getTitle` results are coerced with `|| ''`.

## Other context variables

| Variable | Set in |
|---|---|
| `pageObject` | every hook (used by `this()`, `providerUrlUtility`) |
| `ui` | `sync.uiInjection`, `overview.uiInjection` |
| `provider` | `getMalUrl` |
| `element` | `list.elementUrl`, `list.elementEp` (also the start state) |
| `trigger` | `ready`, `syncIsReady`, `overviewIsReady`, `listChange` |

## this()

`$c.this('<path>')` calls another member of the same page through the proxy, passing the current value as its URL argument. Paths use the chibi names (`sync.getEpisode`, `overview.uiInjection`, `list.elementEp`); the proxy maps them to the legacy names. `this('list.elementsSelector')` returns a **jQuery object**, not an array. Non-function members return as they are.
