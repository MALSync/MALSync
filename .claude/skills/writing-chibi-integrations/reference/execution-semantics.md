# Execution semantics

How a chain behaves at runtime. AGENTS.md covers the build-time/runtime split and the `exec`/`ifNotReturn` conventions; this file covers the precise rules behind them. Source: `src/chibiScript/ChibiConsumer.ts`, `ChibiCtx.ts`, `functions/**`.

## Contents
- State flow and start state
- Argument kinds (ChibiParam vs ChibiJson vs literal vs callback)
- Errors that become null vs errors that abort
- return, ifNotReturn, fn, exec
- Values of and / or / coalesce
- Sync vs async context
- Variables
- URL helpers

## State flow and start state

Each step receives the previous value (`state`) and returns the next one. A hook's top-level chain starts with `null`. The exceptions are `list.elementUrl`/`elementEp`, which start with the list element. Every nested chain argument also starts with `null`, so begin it with a value-producing function (`url()`, `querySelector()`, `target()`, `getVariable()`). Callbacks (`map`, `filter`, `arrayFind`, `ifThen`, …) start with the current item.

## Argument kinds

Check each function's parameter types in `FUNCTIONS.md`:

| Parameter type | Accepts | Resolved by |
|---|---|---|
| `ChibiParam<T>` | a literal **or** `$c....run()` | The consumer, before calling the function (only indices listed in the generated `chibiParamIndices`). Runs with `null` start state. A `ChibiReturn` from that chain is passed through as an object, not unwrapped. |
| `ChibiJson<T>` (e.g. `if`, `and`, `or`, `coalesce`, `fn`, `setVariable` value, `waitUntilTrue`) | a finished chain only | The function itself via `ctx.run`/`ctx.runAsync`, so evaluation can be conditional/lazy |
| plain `string`/`number`/`boolean` (e.g. `string(value)`, `addStyle(css)`) | a literal only | Not resolved; a chain would be passed as raw JSON |
| function `($c) => ...run()` | callback | Converted to JSON at build time; run per item with the item as start state |

## Errors that become null vs errors that abort

- **Ordinary errors** (e.g. `text()` on `null`, `regex()` without a match, `jsonParse()` on bad input): the consumer logs a red `MAL-Sync` console entry (hook name, function, input, args), sets the value to `null` and **continues**. Downstream, `Number(null)` → `0`, `String(null)` → `"null"`, `Boolean(null)` → `false`, which look like valid values.
- **`ChibiError`** aborts the whole hook and is thrown to the caller. Sources:
  - `$c.error(msg)`;
  - an unknown function;
  - setting a reserved variable;
  - `target()`, `provider()` or `trigger()` used where that variable isn't set;
  - `ui*` injection without `ui`;
  - a Promise returned in sync context;
  - running a consumer twice.

## return, ifNotReturn, fn, exec

- `.return()` stops the current subroutine with the current value. `.ifNotReturn(chain?)` does the same when the value is falsy (returns `null`, or the chain's result).
- The return propagates out of a nested chain **only** through functions that hand the nested result back as their own value: `if`, `ifThen`, `coalesce`, the last evaluated argument of sync `and`/`or`, and `ifNotReturn(chain)`. Then it ends the whole hook.
- Elsewhere it does **not** propagate. Inside `map` it becomes the mapped element. Inside `filter`/`arrayFind`/`and`/`or` conditions it counts as truthy. As a `ChibiParam` argument it is passed through as an object.
- `fn(chain)` is a scope that unwraps a return. Wrap a `coalesce`/`if` branch in `fn(...)` when "branch gives `null`" should not end the hook.
- `.exec(helper)` is a **build-time** utility: it calls `helper($c_current)` while generating JSON, so the helper's chain continues from the current value. Use it (AGENTS.md) instead of `helper($c)`.

## Values of and / or / coalesce

- In **sync hooks**, `and`/`or` behave like JS `&&`/`||` over results: they return the last/first evaluated **value**, not necessarily a boolean. Append `.boolean()` when a strict boolean matters.
- In **async (lifecycle) hooks**, `and`/`or` return real `true`/`false`.
- `coalesce` returns the first result that is not `null`/`undefined`; `false`, `''` and `0` count as results.

## Sync vs async context

Sync, overview, list, `getImage`, `uiInjection`, `getMalUrl`, `computedType` and `setup` run synchronously. A function that returns a Promise there throws a `ChibiError`. Such functions include `domReady`, `waitUntilTrue`, `wait`, `debounce`, async `and`/`or`, and any callback that needs `ctx.runAsync`. `ready`, `syncIsReady`, `overviewIsReady` and `listChange` run with `runAsync`, where those work.

## Variables

| Kind | Functions | Scope |
|---|---|---|
| Local | `setVariable(key, chain?)` / `getVariable(key, default?)` | One consumer (one hook execution), shared with its nested chains and callbacks. `this()` starts a new consumer. |
| Global | `setGlobalVariable` / `getGlobalVariable` | Module singleton shared by all hooks of the page session |
| Persistent | `setPersistentVariable` / `getPersistentVariable` | `localStorage` (`mal-sync-chibi-persist-<key>`), survives reloads |

Reserved keys that can't be set: `url`, `ui`, `provider`, `trigger`, `pageObject`, `element`. They can be read with `getVariable` (e.g. `pageObject`).

## URL helpers

`urlPart(n)` splits on `/` and strips `?query`/`#hash` from the returned part: `https://a.com/x/y?q=1` gives 3 → `x`, 4 → `y`. A missing part returns `''`. Results are strings, so compare with string literals or convert with `.number()`.
