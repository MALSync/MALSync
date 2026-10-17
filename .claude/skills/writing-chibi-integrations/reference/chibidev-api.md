# ChibiDev API

`window.ChibiDev` is injected by `npm run chibi` (source: `test/chibiDev/runtime.ts`). AGENTS.md shows the basic calls; this is the full surface. Call it through the Chrome DevTools MCP `evaluate_script` as `async () => ChibiDev.<call>`.

| Member | Returns | Notes |
|---|---|---|
| `$c` | builder | Same as in page code |
| `ready` | Promise | Resolves when page data is loaded |
| `pages()` | `{ loaded: string[], matching: string[] }` | Check `matching` first when nothing happens on a site |
| `challenge()` | `'cloudflare' \| 'turnstile' \| null` | Ask the user to solve challenges; never try yourself (AGENTS.md) |
| `exec(input, { timeout = 15000 })` | `{ value, errors, ms, challenge? }` | `input` is ChibiJson, a chain, or `$c => chain`. Runs with `runAsync`, so async functions work here even when they wouldn't in a sync hook. Sets `url` and, if a page matches, `pageObject` (so `this()` works). Elements are described as `<tag#id.class "text">` |
| `runPage({ timeout = 20000 })` | `{ url, key, name, ready, type, values, expected, errors, warning?, challenge? }` | Runs `init` like the extension. `ready` is `true`, `false` (never triggered) or `'cdn:<type>'`. `type` is `sync`, `overview` or `none`. `values` holds each hook's `{ value, errors? }`, plus `readerConfig` and `list` (`count`, first 3 elements, `epList`). `expected` uses the `tests.json` format |
| `setPages(data)` | — | Replaces the loaded pages (`{ list, pages }`); the CLI calls it automatically |

Notes:
- Reload the tab before each `runPage()`, because it starts the lifecycle again (AGENTS.md).
- `exec` runs in async context, so for code destined for a sync hook, double-check it doesn't depend on async-only functions (`reference/execution-semantics.md`).
- The CLI syncs page data from `dist/webextension/chibi` and `dist/adult/chibi` about once per second, so keep the content watcher running and reload the tab after it rebuilds.
