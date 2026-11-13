---
name: writing-chibi-integrations
description: Writes, fixes and reviews MAL-Sync site integrations in ChibiScript (src/pages-chibi, src/pages-adult) and explains how the ChibiScript runtime, lifecycle and engine behave. Use when adding support for an anime/manga/novel website, fixing a broken page (wrong title/episode/identifier, missing UI, SPA not re-triggering, wrong episode list or reading progress), rewriting a legacy src/pages site as chibi, writing tests.json, debugging with `npm run chibi`/ChibiDev, reviewing a chibi PR, or answering questions about `$c`, `.run()`, `.exec()`, ChibiParam, PageInterface, lifecycle or trigger, even if the user only pastes a site URL and asks to make MAL-Sync work there.
---

# Writing chibi integrations

This skill sits on top of the maintainers' guide `src/pages-chibi/AGENTS.md`, which is authoritative for contribution rules, setup, the ChibiDev workflow, conventions and the `tests.json` format. The skill adds what that guide doesn't cover: precise runtime semantics, lifecycle and engine internals, how page tests compare values, and task workflows. When the two disagree, `AGENTS.md` and the code win; fix this skill.

## Rules that apply to every task

1. Read `src/pages-chibi/AGENTS.md` first, every time.
2. Look up functions in `src/chibiScript/FUNCTIONS.md` (generated and gitignored; create it with `npm run build:chibiTypes`). Don't guess function names or argument order.
3. Don't change `src/chibiScript` for a single page. Needing a new function means discussing it with the maintainers.
4. A step that throws an ordinary error becomes `null` and the chain **continues**, so guard optional data with `.ifNotReturn()`.
5. Nested `$c....run()` arguments start with an empty state; callbacks (`$x => ...`) start with the current item.
6. Verify in the real site with `npm run chibi` + `ChibiDev.runPage()`, then with `CI=true npm run test:headless "<title>"`, before calling work done.

## Task router

Read **every** file listed for your task. Paths are relative to this skill's directory unless they start with `src/`.

| Task | Read |
|---|---|
| Add a new site (or rewrite a legacy one) | `src/pages-chibi/AGENTS.md`, `workflows/new-integration.md`, `reference/execution-semantics.md`, `reference/lifecycle-internals.md`, `reference/page-options.md`, `reference/examples-index.md`, `reference/headless-tests.md` |
| Fix a broken integration | `src/pages-chibi/AGENTS.md`, `workflows/fixing-integration.md`, `reference/execution-semantics.md`, `reference/lifecycle-internals.md`, `reference/chibidev-api.md`, `reference/headless-tests.md` |
| Review a chibi PR | `src/pages-chibi/AGENTS.md`, `workflows/reviewing-integration.md`, `reference/execution-semantics.md`, `reference/lifecycle-internals.md`, `reference/page-options.md` |
| Debug in the chibi browser | `src/pages-chibi/AGENTS.md` (Workflow), `reference/chibidev-api.md`, `reference/execution-semantics.md` |
| Understand build output, loading, remote updates, request proxy | `reference/engine-internals.md`, `reference/page-options.md` |
| Discuss or prepare an engine change (maintainers) | `src/pages-chibi/AGENTS.md`, `reference/engine-internals.md`, `reference/execution-semantics.md` |

## File map

- `workflows/new-integration.md`: checklist for a new site, following the AGENTS.md workflow.
- `workflows/fixing-integration.md`: diagnosing a broken page with ChibiDev and test output.
- `workflows/reviewing-integration.md`: review checklist for chibi PRs.
- `reference/execution-semantics.md`: state flow, ChibiParam resolution, errors vs. aborts, `return`/`fn`/`exec`, `and`/`or`/`coalesce` values, variables.
- `reference/lifecycle-internals.md`: what `trigger()` does, readiness defaults, `computedType`, which hooks get `url`, sync vs. async hooks.
- `reference/page-options.md`: `features` (requestProxy, customDomains), `urls.player`, `computedType`, `readerConfig`, `minimumVersion`.
- `reference/engine-internals.md`: build pipeline, generator, FUNCTIONS.md generation, loader, page matching, adult pages.
- `reference/headless-tests.md`: exactly how `test:headless` compares values, caching, CI flow.
- `reference/chibidev-api.md`: full `ChibiDev` API (options and return fields).
- `reference/examples-index.md`: which implementation demonstrates which pattern.
